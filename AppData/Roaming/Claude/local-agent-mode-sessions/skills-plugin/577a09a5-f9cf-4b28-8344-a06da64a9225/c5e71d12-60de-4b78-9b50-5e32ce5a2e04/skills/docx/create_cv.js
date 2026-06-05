/**
 * CV – Shivananda Subbanna
 * Two-column layout: dark sidebar left, white content right.
 * Font: Montserrat throughout.
 * Includes coloured tools bar and career timeline.
 */
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
  LevelFormat, UnderlineType
} = require('docx');
const fs = require('fs');

// ── Colours ───────────────────────────────────────────────────────────────────
const SIDEBAR_BG   = "162038";
const SIDEBAR_H    = "FFFFFF";
const SIDEBAR_TXT  = "BDC9DC";
const SIDEBAR_LINK = "7EC8E3";
const AI_SIDEBAR   = "8FDDBB";

const TEAL         = "1C6EA4";
const DARK         = "1A1A2E";
const BODY         = "1A1A1A";
const SUBTLE       = "555555";
const SEC_BLUE     = "1F4E79";
const AI_GREEN     = "1A5C38";

const F = "Montserrat";   // font shorthand

const noBorder  = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const sideLine  = { style: BorderStyle.SINGLE, size: 3, color: "3D5A80", space: 2 };

// ── Generic helpers ───────────────────────────────────────────────────────────
const sp     = (before = 0, after = 0) => ({ before, after });
const spacer = (h = 80) => new Paragraph({ spacing: sp(h, 0), children: [new TextRun("")] });

// ── Sidebar helpers ───────────────────────────────────────────────────────────
function sbHead(text) {
  return new Paragraph({
    spacing: sp(220, 60),
    border: { bottom: sideLine },
    children: [new TextRun({
      text: text.toUpperCase(), bold: true, size: 18,
      color: SIDEBAR_H, font: F, characterSpacing: 50
    })]
  });
}
function sbBullet(text, color = SIDEBAR_TXT) {
  return new Paragraph({
    numbering: { reference: "sbul", level: 0 },
    spacing: { before: 44, after: 44, line: 260, lineRule: "auto" },
    children: [new TextRun({ text, size: 16, color, font: F })]
  });
}
function sbPara(text, bold = false, color = SIDEBAR_TXT, size = 16) {
  return new Paragraph({
    spacing: { before: 30, after: 30, line: 256, lineRule: "auto" },
    children: [new TextRun({ text, bold, size, color, font: F })]
  });
}

// ── Main-column helpers ───────────────────────────────────────────────────────
function section(text) {
  return new Paragraph({
    spacing: sp(200, 60),
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: TEAL, space: 3 } },
    children: [new TextRun({
      text: text.toUpperCase(), bold: true, size: 22,
      color: SEC_BLUE, font: F, characterSpacing: 40
    })]
  });
}

// Company row: name left + date right, then role + underlined RESPONSIBILITIES label
function company(name, role, date) {
  return [
    new Table({
      width: { size: 8080, type: WidthType.DXA },
      columnWidths: [5380, 2700],
      rows: [new TableRow({ children: [
        new TableCell({ borders: noBorders, width: { size: 5380, type: WidthType.DXA },
          children: [new Paragraph({ spacing: sp(120, 0), children: [
            new TextRun({ text: name, bold: true, size: 21, color: TEAL, font: F })
          ]})]
        }),
        new TableCell({ borders: noBorders, width: { size: 2700, type: WidthType.DXA },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, spacing: sp(120, 0), children: [
            new TextRun({ text: date, bold: true, size: 18, color: SUBTLE, font: F })
          ]})]
        }),
      ]})]
    }),
    new Paragraph({ spacing: sp(0, 20), children: [
      new TextRun({ text: role, bold: true, size: 20, color: BODY, font: F })
    ]}),
    new Paragraph({ spacing: sp(60, 20), children: [
      new TextRun({
        text: "RESPONSIBILITIES", size: 16, color: SUBTLE, font: F,
        underline: { type: UnderlineType.SINGLE }
      })
    ]}),
    spacer(20),
  ];
}

function bullet(text, ai = false) {
  return new Paragraph({
    numbering: { reference: "mbul", level: 0 },
    spacing: { before: 72, after: 48, line: 268, lineRule: "auto" },
    children: [
      ...(ai ? [new TextRun({ text: "★ ", bold: true, size: 19, color: AI_GREEN, font: F })] : []),
      new TextRun({ text, size: 19, color: ai ? AI_GREEN : BODY, bold: ai, font: F })
    ]
  });
}

function project(title, desc) {
  return [
    spacer(80),
    new Paragraph({ spacing: sp(0, 28), children: [
      new TextRun({ text: "PROJECT HANDLED", size: 16, color: SUBTLE, font: F,
        underline: { type: UnderlineType.SINGLE } })
    ]}),
    new Paragraph({ spacing: sp(10, 28), children: [
      new TextRun({ text: title, bold: true, size: 19, color: BODY, font: F })
    ]}),
    new Paragraph({ spacing: { before: 0, after: 28, line: 272, lineRule: "auto" }, children: [
      new TextRun({ text: desc, size: 17, color: SUBTLE, font: F })
    ]}),
  ];
}

// ── Tools bar  ────────────────────────────────────────────────────────────────
// Replicates the coloured tool-logo row from page 1 of the original PDF
function toolsBar() {
  function makeRow(tools) {
    const N = tools.length;
    const cw = Math.floor(8080 / N);
    const widths = tools.map((_, i) => (i < N - 1 ? cw : 8080 - cw * (N - 1)));
    return new Table({
      width: { size: 8080, type: WidthType.DXA },
      columnWidths: widths,
      rows: [new TableRow({ children: tools.map((t, i) =>
        new TableCell({
          borders: {
            top: noBorder, bottom: noBorder,
            left:  { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          },
          margins: { top: 60, bottom: 60, left: 50, right: 50 },
          shading: { fill: t.bg, type: ShadingType.CLEAR },
          width: { size: widths[i], type: WidthType.DXA },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: t.icon, size: 22, font: F })]
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: t.name, size: 15, bold: true, color: t.fg || "FFFFFF", font: F })]
            }),
          ]
        })
      )})]
    });
  }

  const row1 = [
    { name: "SQL",            icon: "🗄️",  bg: "003865" },
    { name: "Qlik Sense",     icon: "📊",  bg: "009845" },
    { name: "Power BI",       icon: "📈",  bg: "F2C811", fg: "1A1A1A" },
    { name: "Python",         icon: "🐍",  bg: "3776AB" },
    { name: "Tableau",        icon: "📉",  bg: "1F77B4" },
    { name: "AWS Redshift",   icon: "☁️",  bg: "205081" },
    { name: "Netezza / IBM",  icon: "💾",  bg: "0062FF" },
    { name: "Oracle",         icon: "🔶",  bg: "C74634" },
  ];
  const row2 = [
    { name: "Azure ADF",       icon: "⚡",  bg: "0089D6" },
    { name: "MS Fabric",       icon: "🔷",  bg: "7B2FBE" },
    { name: "Knime / Alteryx", icon: "🔄",  bg: "E8A800", fg: "1A1A1A" },
    { name: "Databricks",      icon: "💡",  bg: "FF3621" },
    { name: "Claude AI ★",     icon: "🤖",  bg: AI_GREEN },
    { name: "LangChain ★",     icon: "🔗",  bg: "1C3D2B", fg: AI_SIDEBAR },
    { name: "Claude Code ★",   icon: "⚙️",  bg: "0D2B1E", fg: AI_SIDEBAR },
    { name: "GCP BigQuery",    icon: "📡",  bg: "4285F4" },
  ];

  return [
    spacer(60),
    makeRow(row1),
    new Paragraph({ spacing: sp(2, 2), children: [new TextRun("")] }), // hairline gap
    makeRow(row2),
    spacer(40),
  ];
}

// ── Career Timeline ────────────────────────────────────────────────────────────
// Replicates the horizontal career-progression chart from page 3 of the original PDF
function timeline() {
  const NODES = [
    {
      period:  "2015 – 2021",
      company: "Tata Consultancy\nServices Ltd.",
      role:    "IT Analyst",
      skills:  "SQL • PL/SQL • QlikView • Data & BI",
      loc:     "Bangalore & UAE",
      hdr:     SEC_BLUE,
      bg:      "E8F4FD",
    },
    {
      period:  "2021 – 2022",
      company: "JP Morgan\nChase & Co.",
      role:    "Associate Engineer",
      skills:  "Python • Power BI • Qlik Sense",
      loc:     "Bangalore & UAE",
      hdr:     "174EA6",
      bg:      "EDF8FF",
    },
    {
      period:  "2022 – 2024",
      company: "Landmark Group",
      role:    "Senior BI Developer",
      skills:  "Power BI • Qlik Sense • Azure",
      loc:     "United Arab Emirates",
      hdr:     TEAL,
      bg:      "E8F0FA",
    },
    {
      period:  "2024 – 2025",
      company: "GMG",
      role:    "Data Engineer",
      skills:  "Python • Tableau • Power BI • Azure",
      loc:     "United Arab Emirates",
      hdr:     "1A6B4A",
      bg:      "F0F7FF",
    },
    {
      period:  "2025 – Present",
      company: "Landmark Group",
      role:    "Lead – Data & BI Specialist",
      skills:  "Power BI • AI Agents • Claude API • LangChain",
      loc:     "United Arab Emirates",
      hdr:     AI_GREEN,
      bg:      "E8F9F1",
    },
  ];

  const N   = NODES.length;
  const CW  = Math.floor(8080 / N);
  const ws  = NODES.map((_, i) => (i < N - 1 ? CW : 8080 - CW * (N - 1)));

  // helper: make a cell with optional top-border (the timeline rail)
  function tCell(node, i, children, showRail = false, bg = null) {
    return new TableCell({
      borders: {
        top:    showRail
          ? { style: BorderStyle.SINGLE, size: 8, color: node.hdr }
          : noBorder,
        bottom: noBorder, left: noBorder, right: noBorder,
      },
      width: { size: ws[i], type: WidthType.DXA },
      shading: { fill: bg || node.bg, type: ShadingType.CLEAR },
      margins: { top: 60, bottom: 60, left: 80, right: 80 },
      children,
    });
  }

  // Row 1 – year headers (coloured band)
  const rYear = new TableRow({ children: NODES.map((n, i) =>
    new TableCell({
      borders: noBorders,
      width: { size: ws[i], type: WidthType.DXA },
      shading: { fill: n.hdr, type: ShadingType.CLEAR },
      margins: { top: 60, bottom: 60, left: 80, right: 80 },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: n.period, bold: true, size: 17, color: "FFFFFF", font: F })
      ]})]
    })
  )});

  // Row 2 – dot marker sitting on the rail line
  const rDot = new TableRow({ children: NODES.map((n, i) =>
    tCell(n, i, [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: sp(30, 0), children: [
        new TextRun({ text: i === 4 ? "★" : "●", size: 26, color: n.hdr, font: F })
      ]})
    ], true)
  )});

  // Row 3 – company + role
  const rCompany = new TableRow({ children: NODES.map((n, i) =>
    tCell(n, i, [
      ...n.company.split("\n").map(line =>
        new Paragraph({ spacing: sp(0, 10), children: [
          new TextRun({ text: line, bold: true, size: 17, color: n.hdr, font: F })
        ]})
      ),
      new Paragraph({ spacing: sp(10, 16), children: [
        new TextRun({ text: n.role, size: 17, color: BODY, font: F })
      ]}),
    ])
  )});

  // Row 4 – skills + location
  const rDetail = new TableRow({ children: NODES.map((n, i) =>
    tCell(n, i, [
      new Paragraph({ spacing: sp(0, 16), children: [
        new TextRun({ text: n.skills, size: 15, italics: true, color: SUBTLE, font: F })
      ]}),
      new Paragraph({ children: [
        new TextRun({ text: "📍 " + n.loc, size: 15, color: SUBTLE, font: F })
      ]}),
    ])
  )});

  return [
    spacer(120),
    section("Career Timeline"),
    spacer(60),
    new Table({
      width: { size: 8080, type: WidthType.DXA },
      columnWidths: ws,
      rows: [rYear, rDot, rCompany, rDetail],
    }),
    spacer(60),
  ];
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
const sidebar = [
  sbHead("Contact"),
  spacer(30),
  sbPara("☎  +971 525188618"),
  sbPara("✉  shiva.nisarga1@gmail.com"),
  sbPara("⌂  #611, Building No 12,"),
  sbPara("   Discovery Garden, Dubai"),
  sbPara("🔗  linkedin.com/in/", false, SIDEBAR_LINK),
  sbPara("   shivananda-s-a24653113", false, SIDEBAR_LINK),

  sbHead("Education"),
  spacer(30),
  new Paragraph({ spacing: sp(20, 8), children: [
    new TextRun({ text: "2011 JUL – 2015 JUL", bold: true, size: 17, color: SIDEBAR_H, font: F })
  ]}),
  new Paragraph({ spacing: sp(8, 10), children: [
    new TextRun({ text: "Bachelor Degree – Bachelor of Engineering", bold: true, size: 16, color: SIDEBAR_TXT, font: F })
  ]}),
  sbPara("BMS College of Engineering (Autonomous College), Basavanagudi, Bangalore, Karnataka, India"),

  sbHead("Core Competencies"),
  spacer(30),
  ...["Commercial & Market Analytics", "Forecasting & Scenario Planning",
      "Distributor Channel Analytics", "KPI Design & Reporting",
      "Data Strategy & Modelling", "Business Partnering",
      "Process Improvement", "Stakeholder Management"
  ].map(s => sbBullet(s)),

  sbHead("Core Competencies"),
  spacer(30),
  ...["Azure Data Factory, Azure Databricks, Azure DB. On-Prem, OneLake",
      "Power BI, Qlik Sense, Tableau, OBIEE",
      "Python (Pandas, Automation), SQL, T-SQL, PostgreSQL, PySpark"
  ].map(s => sbBullet(s)),

  sbHead("AI Tools & Automation ★"),
  spacer(30),
  ...["AI Agent Development", "LangChain / AutoGen",
      "Claude API / OpenAI API", "Prompt Engineering",
      "Agentic Workflow Design", "Claude Code (CLI)",
      "LLM-Driven BI Automation", "Python TOM/TMSL Scripting"
  ].map(s => sbBullet(s, AI_SIDEBAR)),

  sbHead("Certification"),
  spacer(30),
  sbBullet("Professional Scrum Master (PSM I)"),
  sbBullet("Power BI – PL 300 (Microsoft)"),

  sbHead("Languages"),
  spacer(30),
  sbBullet("English (Fluent)"),
  sbBullet("Hindi (Fluent)"),
  sbBullet("Kannada (Fluent)"),
];

// ── MAIN CONTENT ──────────────────────────────────────────────────────────────
const main = [

  // Name block
  new Paragraph({ spacing: sp(40, 0), children: [
    new TextRun({ text: "SHIVANANDA ", bold: true, size: 56, color: DARK, font: F }),
    new TextRun({ text: "SUBBANNA",              size: 56, color: "4A4A6A", font: F }),
  ]}),
  new Paragraph({
    spacing: sp(0, 80),
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: TEAL, space: 4 } },
    children: [new TextRun({
      text: "BUSINESS INTELLIGENCE ANALYST  |  FORECASTING & MARKET ANALYTICS  •  POWER BI  •  SQL  •  PYTHON  •  MEA REGION  |  COMMERCIAL  |  SUPPLY CHAIN",
      size: 15, color: SUBTLE, font: F, characterSpacing: 5
    })]
  }),
  spacer(60),

  // ── Profile ────────────────────────────────────────────────────────────────
  section("Profile"),
  spacer(40),
  new Paragraph({ spacing: { before: 0, after: 80, line: 288, lineRule: "auto" }, alignment: AlignmentType.JUSTIFIED, children: [
    new TextRun({ text: "Results-driven Business Intelligence Analyst with ", size: 19, font: F, color: BODY }),
    new TextRun({ text: "10+ years", bold: true, size: 19, font: F, color: BODY }),
    new TextRun({ text: " of experience delivering end-to-end BI and analytical solutions across ", size: 19, font: F, color: BODY }),
    new TextRun({ text: "Commercial, Supply Chain, Finance, E-Commerce, and Retail", bold: true, size: 19, font: F, color: BODY }),
    new TextRun({ text: " functions in the ", size: 19, font: F, color: BODY }),
    new TextRun({ text: "MEA region", bold: true, size: 19, font: F, color: BODY }),
    new TextRun({ text: ". Proven expertise in designing ", size: 19, font: F, color: BODY }),
    new TextRun({ text: "Power BI dashboards", bold: true, size: 19, font: F, color: BODY }),
    new TextRun({ text: ", building automated data pipelines, and translating complex datasets into ", size: 19, font: F, color: BODY }),
    new TextRun({ text: "actionable insights that drive commercial decision-making", bold: true, size: 19, font: F, color: BODY }),
    new TextRun({ text: ". Deep experience in ", size: 19, font: F, color: BODY }),
    new TextRun({ text: "forecasting & scenario planning, distributor and channel performance analytics", bold: true, size: 19, font: F, color: BODY }),
    new TextRun({ text: ", and KPI framework development aligned to executive and operational stakeholders. Adept at business partnering across commercial, finance, and supply chain functions with a strong track record of delivering scalable BI solutions that support ", size: 19, font: F, color: BODY }),
    new TextRun({ text: "market intelligence and performance management", bold: true, size: 19, font: F, color: BODY }),
    new TextRun({ text: ". Augmented with ", size: 19, font: F, color: BODY }),
    new TextRun({ text: "AI-driven automation", bold: true, size: 19, font: F, color: AI_GREEN }),
    new TextRun({ text: " capabilities (Claude API, LangChain, Python TOM) to enable faster, more intelligent BI delivery.", size: 19, font: F, color: BODY }),
  ]}),

  // ── Work Experience ────────────────────────────────────────────────────────
  section("Work Experience | Roles & Responsibilities"),
  spacer(100),

  // Landmark Group – Current
  ...company("Landmark Group (United Arab Emirates)", "Lead – Data & BI Specialist", "MAR 2025 – PRESENT"),
  bullet("Lead periodic forecasting processes to analyse expected performance against quarterly and seasonal targets, identifying risks and opportunities to support commercial execution and strategic planning across MEA."),
  bullet("Drive distributor and wholesale channel analytics — tracking sell-through performance, stock coverage, order fulfilment, and replenishment cycles — enabling data-driven commercial and inventory decisions."),
  bullet("Own the design and delivery of interactive Power BI dashboards enabling CXO and commercial leadership to monitor KPIs across regions, categories, and channels, with automated data pipelines for always-on reporting."),
  bullet("Define and maintain KPI frameworks and reusable data assets that transform raw commercial, supply chain, and finance data into actionable insights for senior stakeholders."),
  bullet("Partner with commercial, finance, and supply chain functions to frame business hypotheses, design analytical models, and deliver scenario planning tools that support executive decision-making."),
  bullet("Leverage Python and advanced analytics techniques to develop market intelligence, competitor benchmarking, and baseline analyses supporting forecasting and pricing strategies."),
  bullet("Implement and manage Microsoft Fabric analytics solutions including Lakehouse, Dataflows, Notebooks, and Pipelines, ensuring optimised compute, storage, and refresh performance."),
  bullet("Build and deploy AI agent workflows using Claude API and LangChain to automate end-to-end BI tasks — including automated DAX measure creation, Power BI model updates via TOM/TMSL, and intelligent data transformation pipelines.", true),
  bullet("Utilise Claude Code (AI CLI) to automate Power BI model scripting, DAX generation, and pipeline configuration, reducing delivery time and enabling rapid iteration on analytical solutions.", true),
  ...project(
    "Sell-Through Optimisation | Season & Channel Performance | Capacity Planning | NB Sellthru Tracker",
    "Developed an in-house BI analytical platform to monitor sell-through, forecast performance against seasonal targets, and recommend Markdown and pricing strategies across WHS, Own DTC, and Franchise channels. Built Power BI dashboards with automated pipelines, distributor channel analytics, KPI scorecards, and dynamic Top/Bottom seller analysis. Technologies: SQL, Python, Power BI, Claude API, LangChain, Azure, AWS Redshift."
  ),

  // ── Tools bar (matches page-1 logo row from original PDF) ─────────────────
  ...toolsBar(),

  spacer(140),

  // GMG
  ...company("GMG (United Arab Emirates)", "Data Engineer", "FEB 2024 – MAR 2025"),
  bullet("Delivered 5+ end-to-end BI analytical solutions — including market channel performance, sales growth analysis, and margin variation — translating business requirements into self-service dashboards and automated reports."),
  bullet("Developed market and competitor analytics models to support commercial teams with pricing insights, trend analysis, and campaign effectiveness measurement across multiple brand portfolios."),
  bullet("Built KPI monitoring frameworks and real-time dashboards in Power BI and Tableau, enabling commercial and marketing stakeholders to track performance and act on emerging risks and opportunities."),
  bullet("Developed automated analytical models for Margin Variation, Sales Growth, and Stock Analysis using PySpark and Python, reducing manual reporting effort and improving decision cycle time."),
  bullet("Led UAT and production deployments using Azure DevOps and Power BI deployment pipelines, ensuring controlled, governed releases across analytics environments."),
  bullet("Built secure, scalable dashboards with row-level and column-level security across Tableau and Power BI to support multi-region and role-based access requirements."),
  bullet("Integrated AI-assisted automation into BI development workflows, leveraging Python-based agentic scripting to accelerate dashboard and pipeline delivery.", true),
  ...project(
    "Marketing Channel Performance | Merch Analytics | GA4 E-Commerce Dashboards | E-Receipt Tracker",
    "Built BI analytics for GMG's brand portfolio (Nike, Jordan, Timberland, Under Armour) to aggregate multi-channel data, monitor KPIs in real time, and support forecasting and scenario planning for commercial teams. Delivered market intelligence and competitor benchmarking dashboards. Technologies: SQL, Python, Power BI, Tableau, AWS Redshift."
  ),

  spacer(80),

  // Landmark – BI Developer
  ...company("Landmark Groups (United Arab Emirates)", "BI Developer – Central Data & BI team", "May 2022 – Feb 2024"),
  bullet("Led the setup and configuration of BI and analytics applications across on-premises environments and virtual machines, CI CD Pipeline, Deployment Process, performance stability, and alignment with enterprise IT standards."),
  bullet("Led 50+ BI Solutions — designed, developed, and optimized complex SQL queries, stored procedures, and ETL workflows using Knime, Alteryx, Informatica, and Databricks notebooks."),
  bullet("Owned troubleshooting and debugging efforts across data lake, ETL, and BI layers, proactively resolving performance, stability, and data integrity issues."),
  bullet("Implemented data governance and quality standards, including data cleansing, deduplication, and validation rules to ensure data accuracy and consistency."),
  bullet("Developed and executed test cases, prioritized testing activities, and tracked defects using Azure DevOps and JIRA, ensuring quality and compliance."),
  bullet("Optimized analytical data models and query performance, applying query tuning, data merging strategies, and model optimization techniques."),
  ...project(
    "Omnichannel – Ecommerce | Smart Buy | Retail Performance | HR Analytics | Finance P&L",
    "Lead BI solution to centralize data and provide real-time visibility into order status, inventory, and customer interactions for Landmark Business. Technologies used: SQL, Python (Pandas), Power BI, Qlik, Azure Data Lake, ADF, Qlik Replicate, Qlik Data Transfer, PySpark, PL/SQL, Unix."
  ),

  spacer(80),

  // JP Morgan
  ...company("JP Morgan & Chase (Bangalore, India)", "Associate Engineer", "Aug 2021 – May 2022"),
  bullet("Developed SQL queries, stored procedures, and scripts to retrieve, manipulate, and analyze data in relational databases, data warehouses, and Azure Data Lakes."),
  bullet("Provided technical support and troubleshooting for data-related issues in production BI applications using Qlik Sense."),
  bullet("Collaborated with data architects, business analysts, and software engineers to design and implement end-to-end BI solutions."),
  bullet("Automated data processing workflows and maintained data integrity across reporting systems (Qlik and Power BI)."),
  bullet("Implemented data quality checks and cleansing procedures to ensure accurate and consistent data for reporting and analysis."),
  bullet("Optimized application performance through indexing, partitioning, query folding, and other techniques."),
  bullet("Developed and maintained data integration solutions for seamless data flow and interoperability across systems and platforms."),
  bullet("Verified and deployed programs to production environments, coordinating with IT operations to ensure successful deployment."),
  ...project(
    "What IF Analysis: (with) Selective Product Price Increase | Chase – Digital Commercial Banking",
    "Provided insights and recommendations on the feasibility and impact of price changes by analyzing historical sales data, market trends, competitor strategies, and customer preferences. Technologies: SQL, Power BI, Qlik Sense, Google BigQuery, and Alteryx."
  ),

  spacer(80),

  // TCS
  ...company("Tata Consultancy Services Ltd.", "IT Analyst", "Oct 2015 – Aug 2021"),
  bullet("Designed and developed BI dashboards using QlikView to effectively visualize data and insights."),
  bullet("Actively participated in requirement gathering and technical grooming sessions with senior leads."),
  bullet("Created unit tests for application components to improve test coverage and validate dashboard data accuracy."),
  bullet("Troubleshot and resolved bugs during internal testing, addressing performance issues in BI applications."),
  bullet("Participated in system testing to verify the performance and functionality of BI dashboards within the data ecosystem."),
  bullet("Provided technical support and resolved data-related issues, addressing anomalies reported by end-users and stakeholders."),
  bullet("Collaborated with cross-functional teams to integrate BI solutions with other systems, ensuring seamless data flow."),
  bullet("Implemented data security measures and access controls using QlikView Section Access to protect sensitive data and ensure compliance with data privacy regulations."),
  bullet("Organized folder structures on Unix/Windows servers to maintain code dependencies for Qlik task monitoring."),

  // ── Career Timeline (matches page-3 chart from original PDF) ──────────────
  ...timeline(),
];

// ── DOCUMENT ──────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      { reference: "sbul", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 300, hanging: 180 } } } }] },
      { reference: "mbul", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 380, hanging: 220 } } } }] },
    ]
  },
  styles: {
    default: { document: { run: { font: F, size: 19, color: BODY } } },
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 0, right: 360, bottom: 360, left: 0 }
      }
    },
    children: [
      new Table({
        width: { size: 11880, type: WidthType.DXA },
        columnWidths: [3100, 8780],
        rows: [new TableRow({
          children: [
            // ── Dark sidebar ────────────────────────────────────────────────
            new TableCell({
              borders: noBorders,
              width: { size: 3100, type: WidthType.DXA },
              shading: { fill: SIDEBAR_BG, type: ShadingType.CLEAR },
              margins: { top: 400, bottom: 400, left: 280, right: 280 },
              children: sidebar,
            }),
            // ── White main column ───────────────────────────────────────────
            new TableCell({
              borders: noBorders,
              width: { size: 8780, type: WidthType.DXA },
              shading: { fill: "FFFFFF", type: ShadingType.CLEAR },
              margins: { top: 400, bottom: 400, left: 420, right: 280 },
              children: main,
            }),
          ]
        })]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  const out = "C:\\Users\\searc\\Downloads\\Shivananda_Subbanna_CV_v4_JnJ.docx";
  fs.writeFileSync(out, buffer);
  console.log("Done:", out);
});
