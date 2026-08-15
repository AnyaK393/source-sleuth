# 📄 PROFESSIONAL README.md FOR SOURCE SLEUTH

```markdown
# 🕸️ Source Sleuth - Visual Citation Mapping Tool

[![UNESCO](https://img.shields.io/badge/UNESCO-Youth%20Hackathon%202026-8B5CF6?style=for-the-badge&logo=unesco)](https://www.unesco.org/en/media-information-literacy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Python 3.13](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1.0-000000?style=for-the-badge&logo=flask)](https://flask.palletsprojects.com)
[![D3.js](https://img.shields.io/badge/D3.js-7.0-F9A03C?style=for-the-badge&logo=d3.js)](https://d3js.org)

---

## 🌟 Overview

**Source Sleuth** is an interactive web application that empowers users to combat misinformation by visually mapping every claim in a news article to its sources. Using an intuitive spider web visualization, it transforms complex media literacy concepts into an engaging, accessible experience.

> *"Don't tell me what to believe. Show me the evidence."*

### 🎯 The Problem We Solve

- 📊 **70%** of people cannot distinguish between real and fake news
- 📊 **60%** share articles without reading them first
- 📊 Misinformation spreads **6x faster** than the truth on social media
- 📊 Traditional fact-checking is slow and inaccessible

### 💡 Our Solution

Source Sleuth makes media literacy **visual, interactive, and accessible** to everyone.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🕸️ **Interactive Visualization** | D3.js spider web with draggable, color-coded nodes |
| 📊 **Trust Score System** | 0-100 credibility score with animated display |
| 🔍 **Real-Time Fact-Checking** | Google Fact Check API integration (100 free searches/day) |
| 🎤 **Voice Input** | Speech-to-text for hands-free analysis (Web Speech API) |
| 🌍 **Multi-Language Support** | 5 languages: English, Spanish, Hindi, French, Arabic |
| 🔄 **Article Comparison** | Side-by-side credibility analysis |
| 📚 **Analysis History** | Save last 20 analyses in browser |
| 📄 **Export & Share** | Download as PNG, Export PDF, Share on Social Media |
| 🎯 **Smart Detection** | Auto-detects article topic from URL or text |
| 🌓 **Dark Mode** | Toggle between light and dark themes |

### Color Coding System

| Color | Meaning | Description |
|-------|---------|-------------|
| 🟢 **Green** | Verified | Claim has credible sources |
| 🟡 **Yellow** | Weak Source | Claim source is questionable |
| 🔴 **Red** | Unsourced | No credible source found |
| 🟣 **Purple** | Article | The main article node (center) |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER (Frontend)                       │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   User       │  │   D3.js      │  │   Web        │  │   i18n       │  │
│  │   Interface  │  │  Visuali-    │  │   Speech     │  │   Multi-     │  │
│  │   (HTML/CSS) │  │   zation     │  │   API        │  │   Language   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                                             │
│  Functions: User Input → Display Results → Interactive Visualization       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER (Backend)                         │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        REST API Gateway                               │  │
│  │              (Flask - Python 3.13)                                    │  │
│  │                                                                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │  │
│  │  │  Smart      │  │   Claim     │  │  Fact-      │  │  Response │  │  │
│  │  │  Detection  │→ │  Extraction │→ │  Check      │→ │  Formatter│  │  │
│  │  │  Engine     │  │  Engine     │  │  Engine     │  │           │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘  │  │
│  │                                                                       │  │
│  │  • Smart Detection: Keyword-based topic identification               │  │
│  │  • Claim Extraction: Natural Language Processing                     │  │
│  │  • Fact-Check: Google Fact Check API Integration                    │  │
│  │  • Response Formatter: JSON response generation                     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA & SERVICES LAYER                               │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Article     │  │  Source      │  │  Trust       │  │  Google      │  │
│  │  Database    │  │  Repository  │  │  Score       │  │  Fact Check  │  │
│  │              │  │              │  │  Calculator  │  │  API         │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | HTML5, CSS3, JavaScript, D3.js, Web Speech API |
| **Backend** | Python 3.13, Flask 3.1.0, REST API |
| **Services** | Google Fact Check API, Web Speech API, Local Storage |
| **Data** | JSON-based article database (8 articles, 40+ claims) |

---

## 📁 Project Structure

```
source-sleuth/
│
├── backend/
│   ├── app.py              # Flask API server
│   └── requirements.txt    # Python dependencies
│
├── data/
│   ├── article_1.json      # Vaccine Misinformation (28/100)
│   ├── article_2.json      # Climate Hoax (40/100)
│   ├── article_3.json      # Election Fraud (35/100)
│   ├── article_4.json      # Essential Oils (22/100)
│   ├── article_5.json      # 5G Conspiracy (30/100)
│   ├── article_6.json      # Vaccine Facts (78/100)
│   ├── article_7.json      # Climate Science (82/100)
│   └── article_8.json      # Election Facts (75/100)
│
├── frontend/
│   ├── index.html          # Main HTML file
│   └── app.js              # JavaScript + D3.js
│
└── README.md               # This file
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.7+
- A modern web browser (Chrome recommended)
- Git

### Installation

**1. Clone the repository:**
```bash
git clone https://github.com/yourusername/source-sleuth.git
cd source-sleuth
```

**2. Install Python dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

**3. (Optional) Configure Google Fact Check API:**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project
- Enable the **Fact Check Tools API**
- Create an API key
- Add your key to `backend/app.py`:
  ```python
  FACTCHECK_API_KEY = "YOUR_API_KEY_HERE"
  ```

### Running the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
python app.py
```
> Server runs at `http://localhost:5000`

**Terminal 2 - Start Frontend:**
```bash
cd frontend
python -m http.server 8000
```
> Server runs at `http://localhost:8000`

**Open in Browser:**
```
http://localhost:8000
```

---

## 🎯 How to Use

### 1. Enter Content
- **URL Tab:** Paste any article URL
- **Text Tab:** Paste the full article text
- **Voice Input:** Click the 🎤 button and speak

### 2. Analyze
- Click **"Analyze"** or press `Ctrl+Enter`
- Watch the spider web visualization appear

### 3. Explore Results
- **Trust Score:** 0-100 credibility score
- **Spider Web:** Drag nodes, click for details
- **Claims Breakdown:** Each claim with status and explanation
- **Sources:** Expand to see suggested credible sources

### 4. Advanced Features
- **Compare:** Click "Compare" to analyze two articles side by side
- **Export:** Download as PNG or Export PDF
- **Share:** Share results on Twitter or LinkedIn
- **History:** View your last 20 analyses
- **Language:** Switch between 5 languages
- **Theme:** Toggle dark/light mode

---

## 🧪 Sample Articles

| Article | Trust Score | Claims | Verified | Weak | Unsourced |
|---------|-------------|--------|----------|------|-----------|
| Vaccine Misinformation | 28/100 🔴 | 5 | 1 | 1 | 3 |
| Climate Hoax | 40/100 🟡 | 5 | 2 | 1 | 2 |
| Election Fraud | 35/100 🟡 | 5 | 2 | 1 | 2 |
| Essential Oils | 22/100 🔴 | 4 | 1 | 0 | 3 |
| 5G Conspiracy | 30/100 🔴 | 4 | 2 | 0 | 2 |
| Vaccine Facts | 78/100 🟢 | 5 | 5 | 0 | 0 |
| Climate Science | 82/100 🟢 | 5 | 5 | 0 | 0 |
| Election Facts | 75/100 🟢 | 5 | 5 | 0 | 0 |

---

## 📊 Demo URLs

| Topic | URL |
|-------|-----|
| Vaccine Misinformation | `https://fakenews.com/vaccine-heart-problems` |
| Climate Hoax | `https://climatedenial.org/climate-hoax` |
| Election Fraud | `https://electionfake.com/voter-fraud` |
| Essential Oils | `https://naturalhealingblog.com/miracle-cure` |
| 5G Conspiracy | `https://techconspiracy.net/5g-brain-control` |
| Vaccine Facts | `https://cdc.gov/covid-vaccines-safety` |
| Climate Science | `https://ipcc.ch/climate-report-2024` |
| Election Facts | `https://electionsecurity.gov/2024-results` |

---

## 🌍 Impact & Use Cases

| Audience | Use Case |
|----------|----------|
| 📚 **Education** | Teach media literacy in schools and universities |
| 📰 **Journalism** | Fact-check articles before publishing |
| 🏛️ **Government & NGOs** | Counter misinformation campaigns |
| 👥 **General Public** | Make informed decisions, become critical thinkers |

---

## 🔮 Future Roadmap

| Feature | Status |
|---------|--------|
| 🔹 Browser Extension | 📋 Planned |
| 🔹 Mobile App (React Native) | 📋 Planned |
| 🔹 AI & ML Integration | 📋 Planned |
| 🔹 Community Fact-Checking | 📋 Planned |
| 🔹 Educational Module | 📋 Planned |
| 🔹 Blockchain Verification | 📋 Planned |

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **UNESCO** for inspiring this project through the Youth Hackathon
- **Google Fact Check API** for free fact-checking capabilities
- **D3.js** for powerful data visualization
- **Flask** for the lightweight backend framework
- **All contributors and testers**

---

## 📧 Contact

- **Project Lead:** [Your Name]
- **Email:** [Your Email]
- **GitHub:** [Your GitHub Link]
- **Twitter:** [Your Twitter Handle]

---

## ⭐ Show Your Support

If you found this project helpful, please give it a ⭐ on GitHub!

---

**🕸️ Source Sleuth - See the Truth in Every Article**

[![UNESCO](https://img.shields.io/badge/UNESCO-Youth%20Hackathon%202026-8B5CF6?style=for-the-badge&logo=unesco)](https://www.unesco.org/en/media-information-literacy)
[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge)](https://github.com/yourusername/source-sleuth)
```

---

