import os
import torch
import faiss
import numpy as np
import torchvision.models as models
import torchvision.transforms as transforms
from torchvision.models import ResNet50_Weights
from PIL import Image
from flask import Flask, request, jsonify

# Initialize Flask app
app = Flask(__name__)

# Allow multiple OpenMP versions
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

# 📂 Set the folder path for images
IMAGE_FOLDER = r"C:\Users\searc\Image Search Engine\data\Apparel\Boys\Images\images_with_product_ids"

# Load pre-trained ResNet50 model
model = models.resnet50(weights=ResNet50_Weights.IMAGENET1K_V1)
model = torch.nn.Sequential(*(list(model.children())[:-1]))  # Remove classification layer
model.eval()

# Define image transformation
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])  # Standard normalization
])

def extract_image_features(image_path):
    """Extract deep learning-based features from an image."""
    try:
        image = Image.open(image_path).convert("RGB")
        image = transform(image).unsqueeze(0)  # Add batch dimension
        with torch.no_grad():
            features = model(image).squeeze().numpy().astype("float32")  # Ensure float32
        print(f"✅ Extracted features from {image_path}, Shape: {features.shape}")  # ✅ Debugging line
        return features
    except Exception as e:
        print(f"❌ Error extracting features from {image_path}: {e}")
        return None

# Ensure the image folder exists
if not os.path.exists(IMAGE_FOLDER):
    print(f"❌ Error: Image folder '{IMAGE_FOLDER}' does not exist!")
    exit(1)

# Load or create FAISS index
INDEX_FILE = "fashion_image_index.faiss"
d = 2048  # ResNet50 output feature dimension

if os.path.exists(INDEX_FILE):
    print(f"🟢 Loading FAISS index from {INDEX_FILE}")
    index = faiss.read_index(INDEX_FILE)
else:
    print("🟡 Creating new FAISS index...")
    index = faiss.IndexFlatL2(d)

def get_all_images():
    """Retrieve all image filenames from the folder"""
    images = [f for f in os.listdir(IMAGE_FOLDER) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    print(f"🟢 Found {len(images)} images in {IMAGE_FOLDER}")
    return images

# 🔴 Ensure indexed_images is defined globally before Flask starts
indexed_images = []

def add_images_to_faiss():
    """Index all images from the folder"""
    global indexed_images
    indexed_images = get_all_images()  # Get filenames

    print(f"🟢 Found {len(indexed_images)} images: {indexed_images}")  # ✅ Debugging line

    if not indexed_images:
        print("❌ No images found in the directory!")
        return

    embeddings = []
    for img_name in indexed_images:
        img_path = os.path.join(IMAGE_FOLDER, img_name)
        print(f"🟡 Processing image: {img_path}")  # ✅ Debugging line
        feature_vector = extract_image_features(img_path)
        if feature_vector is not None:
            embeddings.append(feature_vector)

    if embeddings:
        embeddings = np.array(embeddings).astype("float32")
        index.add(embeddings)
        faiss.write_index(index, INDEX_FILE)
        print(f"✅ Successfully indexed {len(indexed_images)} images into FAISS")

# Populate FAISS with images
if index.ntotal == 0:
    add_images_to_faiss()

# Define home route
@app.route('/', methods=['GET'])
def home():
    return "Flask API is running!", 200

# Define API endpoint for image similarity search
@app.route('/search', methods=['POST'])
def search():
    """API endpoint for image similarity search"""
    print("📌 Received API request...")

    if 'image' not in request.files:
        print("❌ No image found in request.")
        return jsonify({"error": "No image provided."}), 400

    image_file = request.files['image']
    
    # ✅ Save query image inside the same folder as indexed images
    image_path = os.path.join(IMAGE_FOLDER, "5431.jpg")
    image_file.save(image_path)

    print(f"✅ Image saved at {image_path}")

    # Extract features
    query_embedding = extract_image_features(image_path)

    if query_embedding is None:
        print("❌ Query image feature extraction failed!")
        return jsonify({"error": "Failed to process image"}), 500

    print(f"✅ Query image features extracted. Shape: {query_embedding.shape}")  # Expected shape: (2048,)

    query_embedding = query_embedding.reshape(1, -1)

    if index.ntotal == 0:
        print("❌ No images indexed in FAISS!")
        return jsonify({"error": "No indexed images in FAISS"}), 500

    # ✅ Ensure indexed_images is accessible
    global indexed_images  

    # Print indexed images before searching
    print(f"🟢 Indexed images in FAISS: {indexed_images}")

    # Perform FAISS search
    top_k = 5  # Number of matches to return
    distances, indices = index.search(query_embedding, top_k)

    # Convert indices to actual file names
    matched_images = [indexed_images[i] for i in indices[0] if i < len(indexed_images)]

    print(f"✅ Search Results: {matched_images}")

    return jsonify({"similar_products": matched_images})

# Run the Flask app
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True, use_reloader=False)
