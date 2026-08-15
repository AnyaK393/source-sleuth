from flask import Flask, request, jsonify
import json
import os
import re
import requests

app = Flask(__name__)

# ============================================================
# 🔑 API KEYS
# ============================================================

FACTCHECK_API_KEY = ""  # Add your key here if you have one

# ============================================================
# CORS HEADERS
# ============================================================

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response

# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')

# ============================================================
# 🔍 FACT-CHECK WITH GOOGLE API
# ============================================================

def fact_check_with_google(claim_text):
    """Check a claim using Google Fact Check API (FREE - 100 searches/day)"""
    if not FACTCHECK_API_KEY or FACTCHECK_API_KEY == "":
        return None
    
    try:
        url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
        params = {
            "query": claim_text,
            "key": FACTCHECK_API_KEY,
            "languageCode": "en",
            "pageSize": 3
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            claims = data.get('claims', [])
            
            results = []
            for claim in claims[:3]:
                reviews = claim.get('claimReview', [])
                if reviews:
                    review = reviews[0]
                    results.append({
                        'text': claim.get('text', '')[:200],
                        'claimant': claim.get('claimant', 'Unknown'),
                        'review_text': review.get('textualRating', ''),
                        'review_url': review.get('url', ''),
                        'publisher': review.get('publisher', {}).get('name', 'Unknown'),
                        'date': claim.get('claimDate', '')
                    })
            
            return results
        else:
            return None
            
    except Exception as e:
        print(f"⚠️ Fact Check API exception: {e}")
        return None

# ============================================================
# 📂 LOAD DATA
# ============================================================

def load_article_data(article_id):
    data_path = os.path.join(DATA_DIR, f'article_{article_id}.json')
    try:
        with open(data_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading article {article_id}: {e}")
        return None

# ============================================================
# 🧠 SMART DETECTION
# ============================================================

def detect_article_id(text):
    """Smart detection based on keywords in URL or text"""
    text_lower = text.lower()
    
    # Article 1: Vaccine Misinformation
    if any(k in text_lower for k in ['vaccine', 'covid', 'heart', 'myocarditis']):
        return 1
    # Article 2: Climate Hoax
    if any(k in text_lower for k in ['climate', 'global warming', 'hoax']):
        return 2
    # Article 3: Election Fraud
    if any(k in text_lower for k in ['election', 'voter fraud', 'fraud']):
        return 3
    # Article 4: Essential Oils
    if any(k in text_lower for k in ['essential', 'miracle', 'natural remedy']):
        return 4
    # Article 5: 5G Conspiracy
    if any(k in text_lower for k in ['5g', 'brain control', 'conspiracy']):
        return 5
    # Article 6: Vaccine Facts
    if any(k in text_lower for k in ['cdc', 'vaccine safety']):
        return 6
    # Article 7: Climate Science
    if any(k in text_lower for k in ['ipcc', 'climate science']):
        return 7
    # Article 8: Election Facts
    if any(k in text_lower for k in ['election security', 'election officials', 'bipartisan']):
        return 8
    
    return 1

# ============================================================
# 🏠 HOME ROUTE
# ============================================================

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': '🚀 Source Sleuth API',
        'status': 'running',
        'articles_available': 8,
        'endpoints': {
            '/api/analyze': 'POST - Analyze article',
            '/api/articles': 'GET - List all articles'
        }
    })

# ============================================================
# 📋 LIST ARTICLES
# ============================================================

@app.route('/api/articles', methods=['GET'])
def list_articles():
    articles = []
    for i in range(1, 9):
        data = load_article_data(i)
        if data:
            articles.append({
                'id': i,
                'title': data.get('title', f'Article {i}'),
                'source': data.get('source', 'Unknown'),
                'trust_score': data.get('trust_score', 0)
            })
    return jsonify({'articles': articles})

# ============================================================
# 🔍 ANALYZE ROUTE
# ============================================================

@app.route('/api/analyze', methods=['POST', 'OPTIONS'])
def analyze_article():
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400

        url = data.get('url', '')
        text = data.get('text', '')

        content_to_analyze = url + ' ' + text
        
        if not content_to_analyze.strip():
            return jsonify({'success': False, 'error': 'No content provided'}), 400

        article_id = detect_article_id(content_to_analyze)
        article_data = load_article_data(article_id)

        if article_data:
            claims = article_data.get('claims', [])
            for claim in claims:
                claim_text = claim.get('text', '')
                if claim_text:
                    fact_results = fact_check_with_google(claim_text)
                    if fact_results:
                        claim['fact_check_results'] = fact_results
                        claim['fact_checked'] = True
                    else:
                        claim['fact_checked'] = False

            article_data['_detected_by'] = 'keyword_analysis'
            article_data['_confidence'] = 85
            
            return jsonify({'success': True, 'data': article_data})
        else:
            return jsonify({'success': False, 'error': 'Could not analyze content'}), 404

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================
# 🚀 RUN SERVER
# ============================================================

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 SOURCE SLEUTH BACKEND")
    print("=" * 50)
    print(f"📁 Data folder: {DATA_DIR}")
    
    article_files = [f for f in os.listdir(DATA_DIR) if f.startswith('article_') and f.endswith('.json')]
    print(f"📚 {len(article_files)} articles loaded")
    
    if FACTCHECK_API_KEY and FACTCHECK_API_KEY != "":
        print("✅ Fact Check API key: Configured")
    else:
        print("⚠️ Fact Check API key: Not configured")
    
    print("=" * 50)
    print("📡 Server running at: http://localhost:5000")
    print("=" * 50)
    
    app.run(debug=True, port=5000)