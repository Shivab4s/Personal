const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, LevelFormat, PageBreak
} = require('docx');
const fs = require('fs');

const BLUE       = "1F4E79";
const LIGHT_BLUE = "D6E4F0";
const MID_BLUE   = "2E75B6";
const ACCENT     = "C00000";
const GREY_BG    = "F2F2F2";
const WHITE      = "FFFFFF";
const TEXT       = "1A1A1A";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: MID_BLUE, space: 4 } },
    children: [new TextRun({ text, bold: true, size: 28, color: BLUE, font: "Arial" })]
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24, color: MID_BLUE, font: "Arial" })]
  });
}

function body(text, bold = false, color = TEXT) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, bold, size: 22, color, font: "Arial" })]
  });
}

function bullet(text, bold = false) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, bold, size: 22, color: TEXT, font: "Arial" })]
  });
}

function numbered(text, bold = false) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, bold, size: 22, color: TEXT, font: "Arial" })]
  });
}

function subBullet(text) {
  return new Paragraph({
    numbering: { reference: "subbullets", level: 0 },
    spacing: { before: 30, after: 30 },
    children: [new TextRun({ text, size: 20, color: "444444", font: "Arial" })]
  });
}

function noteBox(text) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({
      children: [new TableCell({
        borders,
        width: { size: 9360, type: WidthType.DXA },
        shading: { fill: "FFF3CD", type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 160, right: 160 },
        children: [new Paragraph({
          children: [
            new TextRun({ text: "Note: ", bold: true, size: 20, color: "7D5A00", font: "Arial" }),
            new TextRun({ text, size: 20, color: "7D5A00", font: "Arial" })
          ]
        })]
      })]
    })]
  });
}

function codeBox(lines) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({
      children: [new TableCell({
        borders,
        width: { size: 9360, type: WidthType.DXA },
        shading: { fill: "1E1E1E", type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 200, right: 200 },
        children: lines.map(line => new Paragraph({
          spacing: { before: 20, after: 20 },
          children: [new TextRun({ text: line, size: 18, color: "D4D4D4", font: "Courier New" })]
        }))
      })]
    })]
  });
}

function folderRow(indent, icon, name, desc, isHeader = false) {
  const pad = " ".repeat(indent * 4);
  return new TableRow({
    children: [
      new TableCell({
        borders,
        width: { size: 3800, type: WidthType.DXA },
        shading: { fill: isHeader ? LIGHT_BLUE : WHITE, type: ShadingType.CLEAR },
        margins: { top: 60, bottom: 60, left: 120, right: 80 },
        children: [new Paragraph({
          children: [new TextRun({ text: pad + icon + " " + name, bold: isHeader, size: 18, font: "Courier New", color: isHeader ? BLUE : "333333" })]
        })]
      }),
      new TableCell({
        borders,
        width: { size: 5560, type: WidthType.DXA },
        shading: { fill: isHeader ? LIGHT_BLUE : WHITE, type: ShadingType.CLEAR },
        margins: { top: 60, bottom: 60, left: 120, right: 80 },
        children: [new Paragraph({
          children: [new TextRun({ text: desc, bold: isHeader, size: 18, font: "Arial", color: isHeader ? BLUE : "555555" })]
        })]
      })
    ]
  });
}

function spacer() {
  return new Paragraph({ spacing: { before: 100, after: 100 }, children: [new TextRun("")] });
}

const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•",
          alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 260 } } } }] },
      { reference: "subbullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "◦",
          alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 900, hanging: 260 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 280 } } } }] },
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22, color: TEXT } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: BLUE },
        paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: MID_BLUE },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 1 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1260, bottom: 1260, left: 1260 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: MID_BLUE, space: 4 } },
          children: [
            new TextRun({ text: "S1’26 vs S1’27 Order Performance Dashboard  —  Refresh Guide", size: 18, color: "888888", font: "Arial" }),
          ]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: MID_BLUE, space: 4 } },
          tabStops: [{ type: "right", position: 9360 }],
          children: [
            new TextRun({ text: "Confidential — Internal Use Only", size: 16, color: "AAAAAA", font: "Arial" }),
            new TextRun({ text: "\tPage ", size: 16, color: "AAAAAA", font: "Arial" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "AAAAAA", font: "Arial" }),
          ]
        })]
      })
    },
    children: [
      // ─── TITLE BLOCK ────────────────────────────────────────────────────────
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [new TableRow({
          children: [new TableCell({
            borders: noBorders,
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill: BLUE, type: ShadingType.CLEAR },
            margins: { top: 300, bottom: 300, left: 400, right: 400 },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new TextRun({ text: "S1’26 vs S1’27", size: 44, bold: true, color: WHITE, font: "Arial" })]
              }),
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new TextRun({ text: "Order Performance Dashboard", size: 32, bold: false, color: "A8C8E8", font: "Arial" })]
              }),
              new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { before: 120 },
                children: [new TextRun({ text: "Refresh & Setup Guide", size: 24, color: "CFE2F3", font: "Arial", italics: true })]
              }),
            ]
          })]
        })]
      }),

      spacer(),

      // ─── SECTION 1: PREREQUISITES ───────────────────────────────────────────
      heading1("1.  Prerequisites"),
      body("Ensure the following software is installed before proceeding:"),
      spacer(),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3000, 3200, 3160],
        rows: [
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 3000, type: WidthType.DXA }, shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Software", bold: true, size: 20, font: "Arial", color: BLUE })] })] }),
              new TableCell({ borders, width: { size: 3200, type: WidthType.DXA }, shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Version", bold: true, size: 20, font: "Arial", color: BLUE })] })] }),
              new TableCell({ borders, width: { size: 3160, type: WidthType.DXA }, shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: "Purpose", bold: true, size: 20, font: "Arial", color: BLUE })] })] }),
            ]
          }),
          ...[
            ["Power BI Desktop", "Latest (2024+)", "Open and refresh .pbix file"],
            ["Microsoft Excel", "2016 or later", "Edit the source data file"],
            ["Windows OS", "Windows 10 / 11", "File path compatibility"],
          ].map(([sw, ver, pur]) => new TableRow({
            children: [
              new TableCell({ borders, width: { size: 3000, type: WidthType.DXA }, margins: { top: 70, bottom: 70, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: sw, size: 20, font: "Arial" })] })] }),
              new TableCell({ borders, width: { size: 3200, type: WidthType.DXA }, margins: { top: 70, bottom: 70, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: ver, size: 20, font: "Arial" })] })] }),
              new TableCell({ borders, width: { size: 3160, type: WidthType.DXA }, margins: { top: 70, bottom: 70, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: pur, size: 20, font: "Arial" })] })] }),
            ]
          }))
        ]
      }),

      spacer(),

      // ─── SECTION 2: FOLDER STRUCTURE ────────────────────────────────────────
      heading1("2.  Folder Structure"),
      body("All dashboard files must reside in the following folder structure. Do not rename or move any file."),
      spacer(),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3800, 5560],
        rows: [
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 3800, type: WidthType.DXA }, shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 80 },
              children: [new Paragraph({ children: [new TextRun({ text: "File / Folder", bold: true, size: 20, font: "Arial", color: BLUE })] })] }),
            new TableCell({ borders, width: { size: 5560, type: WidthType.DXA }, shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 80 },
              children: [new Paragraph({ children: [new TextRun({ text: "Description", bold: true, size: 20, font: "Arial", color: BLUE })] })] }),
          ]}),
          folderRow(0, "📂", "C:\\Power BI\\SS26 vs SS27\\", "Root dashboard folder", true),
          folderRow(1, "📊", "Order Comparison (Dashboard).pbix", "Main Power BI report file"),
          folderRow(1, "📄", "S1'26 vs S1'27 DATA.xlsx", "Source data — updated each season"),
          folderRow(1, "📄", "currency.csv", "Currency codes & conversion rates"),
          folderRow(1, "📄", "market_currency_map.csv", "Market to base currency mapping"),
        ]
      }),

      spacer(),
      noteBox("If the root folder C:\\Power BI\\SS26 vs SS27\\ does not exist, create it manually before placing any files."),
      spacer(),

      // ─── SECTION 3: DATA FILE ───────────────────────────────────────────────
      heading1("3.  Preparing the Data File"),
      body("The dashboard reads data from a single Excel file. Follow these steps each time new seasonal data is available."),
      spacer(),

      heading2("3.1  Sheet Requirements"),
      body("The Excel file must contain the following sheets with exact names:"),
      spacer(),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2000, 2800, 4560],
        rows: [
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 2000, type: WidthType.DXA }, shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: "Sheet Name", bold: true, size: 20, font: "Arial", color: BLUE })] })] }),
            new TableCell({ borders, width: { size: 2800, type: WidthType.DXA }, shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: "Used For", bold: true, size: 20, font: "Arial", color: BLUE })] })] }),
            new TableCell({ borders, width: { size: 4560, type: WidthType.DXA }, shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: "Key Columns", bold: true, size: 20, font: "Arial", color: BLUE })] })] }),
          ]}),
          ...[
            ["Sheet3", "ORDER_COMP table", "SEASON, CATEGORY, STYLECODE, GBU, ACCOUNTS, QTY, ORD VALUE, GP VALUE, MARKET, CHANNEL, Markets"],
          ].map(([s, u, k]) => new TableRow({ children: [
            new TableCell({ borders, width: { size: 2000, type: WidthType.DXA }, margins: { top: 70, bottom: 70, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: s, size: 20, font: "Courier New" })] })] }),
            new TableCell({ borders, width: { size: 2800, type: WidthType.DXA }, margins: { top: 70, bottom: 70, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: u, size: 20, font: "Arial" })] })] }),
            new TableCell({ borders, width: { size: 4560, type: WidthType.DXA }, margins: { top: 70, bottom: 70, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: k, size: 18, font: "Arial", color: "555555" })] })] }),
          ]}))
        ]
      }),
      spacer(),

      heading2("3.2  Markets Column Values"),
      body("The Markets column must contain one of the following values per row:"),
      bullet("MENA  —  Data in AED (Middle East & North Africa)"),
      bullet("SAF  —  Data in RAND (South Africa)"),
      bullet("IND  —  Data in INR (India)"),
      spacer(),
      noteBox("The Markets column drives automatic currency conversion. Any value not listed in market_currency_map.csv will default to AED."),
      spacer(),

      // ─── SECTION 4: REFRESH STEPS ───────────────────────────────────────────
      new Paragraph({ children: [new PageBreak()] }),
      heading1("4.  Step-by-Step Refresh Process"),
      spacer(),

      heading2("Step 1 — Place the Updated Data File"),
      numbered("Receive the new S1’26 vs S1’27 DATA.xlsx from the data team."),
      numbered("Copy the file to:"),
      codeBox(["C:\\Power BI\\SS26 vs SS27\\S1'26 vs S1'27 DATA.xlsx"]),
      numbered("If a previous version exists, overwrite it (same filename must be kept)."),
      spacer(),

      heading2("Step 2 — Update Currency Rates (if required)"),
      numbered("Open currency.csv in Notepad or Excel from:"),
      codeBox(["C:\\Power BI\\SS26 vs SS27\\currency.csv"]),
      numbered("Update the Conversion Rate column with current rates (base: 1 AED = X):"),
      spacer(),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2000, 3200, 2000, 2160],
        rows: [
          new TableRow({ children: [
            ...[["Currency",""], ["Currency Name",""], ["Sort Order",""], ["Conversion Rate","Update this"]].map(([h, n], i) =>
              new TableCell({ borders, width: { size: [2000,3200,2000,2160][i], type: WidthType.DXA }, shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 80 },
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, font: "Arial", color: BLUE })] })] }))
          ]}),
          ...[
            ["AED","UAE Dirham","1","1.0000"],
            ["RAND","South African Rand","2","5.0400"],
            ["INR","Indian Rupee","3","22.7500"],
            ["USD","US Dollar","4","0.2723"],
          ].map(row => new TableRow({ children: row.map((val, i) =>
            new TableCell({ borders, width: { size: [2000,3200,2000,2160][i], type: WidthType.DXA }, shading: { fill: i === 3 ? "FFFBE6" : WHITE, type: ShadingType.CLEAR }, margins: { top: 70, bottom: 70, left: 120, right: 80 },
              children: [new Paragraph({ children: [new TextRun({ text: val, size: 20, font: i === 0 ? "Courier New" : "Arial", bold: i === 3 })] })] })
          )}))
        ]
      }),
      spacer(),
      numbered("Save and close the file."),
      spacer(),

      heading2("Step 3 — Add New Market Mapping (if new market data)"),
      numbered("Open market_currency_map.csv from:"),
      codeBox(["C:\\Power BI\\SS26 vs SS27\\market_currency_map.csv"]),
      numbered("Add a new row for the new market following this format:"),
      codeBox([
        "Markets,Market Name,Base Currency",
        "MENA,Middle East & North Africa,AED",
        "SAF,South Africa,RAND",
        "IND,India,INR",
        "XXX,New Market Name,CURRENCY_CODE   <-- add new row here"
      ]),
      numbered("Save and close the file."),
      spacer(),

      heading2("Step 4 — Open the Dashboard in Power BI Desktop"),
      numbered("Launch Power BI Desktop."),
      numbered("Open the report file:"),
      codeBox(["C:\\Power BI\\SS26 vs SS27\\Order Comparison (Dashboard).pbix"]),
      numbered("Wait for the file to fully load before proceeding."),
      spacer(),

      heading2("Step 5 — Refresh the Data"),
      numbered("In the Power BI ribbon, click the Home tab."),
      numbered("Click Refresh (or press Alt + F5)."),
      numbered("A progress bar will appear. Wait for all tables to complete."),
      numbered("If any table shows an error, see Section 6 (Troubleshooting)."),
      spacer(),
      noteBox("The Last Refreshed timestamp on the dashboard will update automatically once the refresh completes successfully."),
      spacer(),

      heading2("Step 6 — Save the File"),
      numbered("Press Ctrl + S to save the .pbix file."),
      numbered("Confirm the save when prompted."),
      numbered("The dashboard is now ready to share or publish."),
      spacer(),

      // ─── SECTION 5: CURRENCY SLICER ─────────────────────────────────────────
      heading1("5.  Using the Currency Toggle"),
      body("The dashboard includes a Currency slicer that converts all monetary values in real time."),
      spacer(),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2000, 3000, 4360],
        rows: [
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 2000, type: WidthType.DXA }, shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: "Selection", bold: true, size: 20, font: "Arial", color: BLUE })] })] }),
            new TableCell({ borders, width: { size: 3000, type: WidthType.DXA }, shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: "Currency", bold: true, size: 20, font: "Arial", color: BLUE })] })] }),
            new TableCell({ borders, width: { size: 4360, type: WidthType.DXA }, shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: "Note", bold: true, size: 20, font: "Arial", color: BLUE })] })] }),
          ]}),
          ...[
            ["AED", "UAE Dirham", "Default. No conversion applied."],
            ["RAND", "South African Rand", "All values converted from base currency."],
            ["INR", "Indian Rupee", "All values converted from base currency."],
            ["USD", "US Dollar", "All values converted from base currency."],
          ].map(([sel, cur, note]) => new TableRow({ children: [
            new TableCell({ borders, width: { size: 2000, type: WidthType.DXA }, margins: { top: 70, bottom: 70, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: sel, size: 20, bold: true, font: "Arial" })] })] }),
            new TableCell({ borders, width: { size: 3000, type: WidthType.DXA }, margins: { top: 70, bottom: 70, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: cur, size: 20, font: "Arial" })] })] }),
            new TableCell({ borders, width: { size: 4360, type: WidthType.DXA }, margins: { top: 70, bottom: 70, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: note, size: 20, font: "Arial", color: "555555" })] })] }),
          ]}))
        ]
      }),
      spacer(),
      body("The Currency Conversion Note card on the dashboard always shows the active rate, e.g.:"),
      spacer(),
      codeBox([
        "1 AED = 5.04 RAND  |  South African Rand  |  Values converted from AED"
      ]),
      spacer(),

      // ─── SECTION 6: TROUBLESHOOTING ─────────────────────────────────────────
      new Paragraph({ children: [new PageBreak()] }),
      heading1("6.  Troubleshooting"),
      spacer(),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3600, 5760],
        rows: [
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 3600, type: WidthType.DXA }, shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: "Issue", bold: true, size: 20, font: "Arial", color: BLUE })] })] }),
            new TableCell({ borders, width: { size: 5760, type: WidthType.DXA }, shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: "Resolution", bold: true, size: 20, font: "Arial", color: BLUE })] })] }),
          ]}),
          ...[
            ["Data source error on refresh", "Verify the Excel file is placed at the exact path: C:\\Power BI\\SS26 vs SS27\\S1'26 vs S1'27 DATA.xlsx. Do not rename the file."],
            ["Currency values not converting", "Check that currency.csv exists in the folder and contains all four currency codes. Refresh the dashboard again after saving the file."],
            ["New market data not converting correctly", "Open market_currency_map.csv and confirm the new Markets value and Base Currency are added. Refresh after saving."],
            ["Blank KPI cards after refresh", "Confirm Sheet3 of the Excel file contains data and the column headers match exactly (case-sensitive)."],
            ["Last Refreshed timestamp not updating", "This updates on every full data refresh. If it shows an old time, trigger a manual refresh via Home > Refresh in Power BI Desktop."],
            ["Wrong currency shown in title", "Ensure the Currency slicer has a value selected. If blank, it defaults to AED. Select the desired currency explicitly."],
          ].map(([issue, fix]) => new TableRow({ children: [
            new TableCell({ borders, width: { size: 3600, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 80 }, shading: { fill: "FFF8F8", type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: issue, size: 20, font: "Arial", bold: true, color: ACCENT })] })] }),
            new TableCell({ borders, width: { size: 5760, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 80 },
              children: [new Paragraph({ children: [new TextRun({ text: fix, size: 20, font: "Arial" })] })] }),
          ]}))
        ]
      }),
      spacer(),

      // ─── SECTION 7: QUICK REFERENCE ─────────────────────────────────────────
      heading1("7.  Quick Reference Checklist"),
      body("Use this checklist every time you refresh the dashboard:"),
      spacer(),
      ...[
        "New data file received and renamed correctly (S1'26 vs S1'27 DATA.xlsx)",
        "File placed in C:\\Power BI\\SS26 vs SS27\\",
        "Currency rates updated in currency.csv (if rates have changed)",
        "New market rows added to market_currency_map.csv (if new market data)",
        "Power BI Desktop opened with Order Comparison (Dashboard).pbix",
        "Refresh completed with no errors (Home > Refresh)",
        "Last Refreshed timestamp verified on dashboard",
        "File saved (Ctrl + S)",
      ].map(item => bullet(item)),
      spacer(),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("C:\\Power BI\\SS26 vs SS27\\Dashboard Refresh Guide.docx", buffer);
  console.log("Done: C:\\Power BI\\SS26 vs SS27\\Dashboard Refresh Guide.docx");
});
