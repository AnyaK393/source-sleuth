# 🕸️ Source Sleuth - Visual Citation Mapping

## 🌟 Overview

**Source Sleuth** is an innovative web application that helps users visualize the credibility of news articles through interactive spider web maps. By analyzing claims and their sources, it empowers users to become critical thinkers in the age of misinformation.

### 🎯 Key Features

- **Interactive Spider Web Visualization**: See every claim mapped to its source
- **Trust Score**: Get an instant credibility score (0-100)
- **Claim Breakdown**: Each claim is analyzed and color-coded:
  - 🟢 **Verified** - Claims with credible sources
  - 🟡 **Weak** - Claims with questionable sources
  - 🔴 **Unsourced** - Claims with no credible sources
- **Source Suggestions**: Missing sources? We suggest credible alternatives
- **Article Comparison**: Compare two articles side by side
- **Open Source**: Free and customizable for anyone

---

## 🏆 Why Source Sleuth?

In today's information ecosystem, misinformation spreads faster than ever. **Source Sleuth** addresses this by:

1. **Teaching Critical Thinking** - Not telling users what to believe, but showing them *how* to evaluate sources
2. **Making MIL Visual** - Complex concepts become clear through interactive visualizations
3. **Empowering Youth** - Designed for students, journalists, and anyone who consumes news
4. **Aligned with UNESCO's MIL Principles** - Promoting Media and Information Literacy globally

---

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | HTML5, CSS3, JavaScript |
| **Visualization** | D3.js (Data-Driven Documents) |
| **Backend** | Python Flask |
| **API** | RESTful API |
| **Data Format** | JSON |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.7+
- A modern web browser (Chrome, Firefox, Edge, Safari)
- Git (for cloning)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/source-sleuth.git
   cd source-sleuth

2. Install Python dependencies:
cd backend
pip install -r requirements.txt

3. Run the backend server:
python app.py
Server will run at http://localhost:5000

4. Open the frontend:

Option A: Double-click frontend/index.html

Option B: Run a local server:
cd frontend
python -m http.server 8000

5. Start Analyzing! Click any sample article or paste a URL.

How It Works
The Analysis Process
User Input: Enter a news article URL

Claim Extraction: The backend identifies key claims

Source Validation: Each claim is checked against credible sources

Visualization: Results are displayed as an interactive spider web

Trust Score: An overall credibility score is calculated

Color Coding System
Color	Meaning	Description
🟢 Green	Verified	Claim has credible sources
🟡 Yellow	Weak Source	Claim source is questionable
🔴 Red	Unsourced	No credible source found
🟣 Purple	Article	The main article node
🎨 Screenshots


📁 Project Structure
text
source-sleuth/
│
├── backend/
│   ├── app.py              # Flask API server
│   └── requirements.txt    # Python dependencies
│
├── data/
│   ├── article_1.json      # Sample: Vaccine Misinfo
│   ├── article_2.json      # Sample: Climate Hoax
│   └── article_3.json      # Sample: Election Fraud
│
├── frontend/
│   ├── index.html          # Main HTML file
│   └── app.js              # JavaScript + D3.js
│
└── README.md               # This file

