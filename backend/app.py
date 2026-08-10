from flask import Flask, request, jsonify
import json
import os
import re
import requests

app = Flask(__name__)

# ============================================================
# 🔑 API KEYS
# ============================================================

FACTCHECK_API_KEY = "API KEY HERE"  # Replace with your Google Fact Check API key

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
    if not FACTCHECK_API_KEY or FACTCHECK_API_KEY == "YOUR_API_KEY_HERE":
        print("⚠️ No Fact Check API key provided. Using fallback data.")
        return None
    
    try:
        url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
        params = {
            "query": claim_text,
            "key": FACTCHECK_API_KEY,
            "languageCode": "en",
            "pageSize": 3
        }
        
        print(f"🔍 Fact-checking: {claim_text[:50]}...")
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            claims = data.get('claims', [])
            
            results = []
            for claim in claims[:3]:
                claim_text_result = claim.get('text', '')
                claimant = claim.get('claimant', 'Unknown')
                claim_date = claim.get('claimDate', '')
                
                reviews = claim.get('claimReview', [])
                if reviews:
                    review = reviews[0]
                    results.append({
                        'text': claim_text_result[:200],
                        'claimant': claimant,
                        'review_text': review.get('textualRating', ''),
                        'review_url': review.get('url', ''),
                        'publisher': review.get('publisher', {}).get('name', 'Unknown'),
                        'date': claim_date
                    })
            
            print(f"✅ Fact-check found {len(results)} results")
            return results
        else:
            print(f"⚠️ Fact Check API error: {response.status_code}")
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
    # Article 6: Vaccine Facts (High Credibility)
    if any(k in text_lower for k in ['cdc', 'vaccine safety']):
        return 6
    # Article 7: Climate Science (High Credibility)
    if any(k in text_lower for k in ['ipcc', 'climate science']):
        return 7
    # Article 8: Election Facts (High Credibility)
    if any(k in text_lower for k in ['election security', 'election officials', 'bipartisan']):
        return 8
    
    return 1  # Default to Article 1

# ============================================================
# 🏠 HOME ROUTE
# ============================================================

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': '🚀 Source Sleuth API',
        'status': 'running',
        'data_folder': DATA_DIR,
        'articles_available': 8,
        'endpoints': {
            '/api/analyze': 'POST - Analyze article (send url or text)',
            '/api/articles': 'GET - List all available articles'
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

        # Smart detection
        article_id = detect_article_id(content_to_analyze)
        article_data = load_article_data(article_id)

        if article_data:
            # 🔍 FACT-CHECK EACH CLAIM
            claims = article_data.get('claims', [])
            fact_checked_count = 0
            for claim in claims:
                claim_text = claim.get('text', '')
                if claim_text:
                    fact_results = fact_check_with_google(claim_text)
                    if fact_results:
                        claim['fact_check_results'] = fact_results
                        claim['fact_checked'] = True
                        fact_checked_count += 1
                    else:
                        claim['fact_checked'] = False

            article_data['_detected_by'] = 'keyword_analysis'
            article_data['_confidence'] = 85
            article_data['_fact_checked_count'] = fact_checked_count
            article_data['_total_claims'] = len(claims)
            
            print(f"✅ Analyzed article {article_id}: {article_data.get('title', 'Unknown')}")
            print(f"   📊 {fact_checked_count}/{len(claims)} claims fact-checked")
            
            return jsonify({'success': True, 'data': article_data})
        else:
            return jsonify({'success': False, 'error': f'Could not analyze content. Article ID: {article_id} not found.'}), 404

    except Exception as e:
        print(f"❌ Error in analyze_article: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================
# 🚀 RUN SERVER
# ============================================================

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 SOURCE SLEUTH BACKEND")
    print("=" * 50)
    print(f"📁 Data folder: {DATA_DIR}")
    
    # Count articles
    article_files = [f for f in os.listdir(DATA_DIR) if f.startswith('article_') and f.endswith('.json')]
    print(f"📚 {len(article_files)} articles loaded")
    
    # Check API key
    if FACTCHECK_API_KEY and FACTCHECK_API_KEY != "YOUR_API_KEY_HERE":
        print("✅ Fact Check API key: Configured")
    else:
        print("⚠️ Fact Check API key: Not configured (using fallback data)")
    
    print("=" * 50)
    print("📡 Server running at: http://localhost:5000")
    print("🔍 Test with: http://localhost:5000/api/articles")
    print("=" * 50)
    print("Press CTRL+C to stop")
    print("=" * 50)
    
    app.run(debug=True, port=5000)