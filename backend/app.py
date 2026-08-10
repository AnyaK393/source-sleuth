from flask import Flask, request, jsonify
import json
import os
import re

app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')

KEYWORD_MAP = {
    # Existing articles
    'vaccine': 1,
    'covid': 1,
    'heart': 1,
    'climate': 2,
    'global warming': 2,
    'hoax': 2,
    'election': 3,
    'voter fraud': 3,
    'fraud': 3,
    'essential': 4,
    'miracle': 4,
    'natural remedy': 4,
    '5g': 5,
    'brain control': 5,
    'radiation': 5,
    'conspiracy': 5,
    
    # NEW HIGH-CREDIBILITY ARTICLES
    'cdc': 6,
    'vaccine safety': 6,
    'ipcc': 7,
    'climate science': 7,
    'election security': 8,
    'bipartisan': 8
}

def detect_article_id(text):
    """Smart detection based on keywords in URL or text"""
    text_lower = text.lower()
    for keyword, article_id in KEYWORD_MAP.items():
        if keyword in text_lower:
            return article_id
    return 1  # Default to first article

def load_article_data(article_id):
    data_path = os.path.join(DATA_DIR, f'article_{article_id}.json')
    try:
        with open(data_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading article {article_id}: {e}")
        return None

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': '🚀 Source Sleuth API',
        'status': 'running',
        'articles_available': 5,
        'endpoints': {
            '/api/analyze': 'POST - Analyze article (URL or text)',
            '/api/articles': 'GET - List all available samples'
        }
    })

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

        # Detect based on URL or text
        content_to_analyze = url + ' ' + text
        
        if not content_to_analyze.strip():
            return jsonify({'success': False, 'error': 'No content provided'}), 400

        # Smart detection
        article_id = detect_article_id(content_to_analyze)
        article_data = load_article_data(article_id)

        # Add detection metadata
        if article_data:
            article_data['_detected_by'] = 'keyword_analysis'
            article_data['_confidence'] = 85  # Confidence score
            return jsonify({'success': True, 'data': article_data})
        else:
            return jsonify({'success': False, 'error': 'Could not analyze content'}), 404

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/articles', methods=['GET'])
def list_articles():
    articles = []
    for i in range(1, 6):
        data = load_article_data(i)
        if data:
            articles.append({
                'id': i,
                'title': data.get('title', f'Article {i}'),
                'source': data.get('source', 'Unknown')
            })
    return jsonify({'articles': articles})

if __name__ == '__main__':
    print("🚀 Source Sleuth Backend")
    print(f"📁 Data folder: {DATA_DIR}")
    print(f"📚 {len([f for f in os.listdir(DATA_DIR) if f.startswith('article_')])} articles loaded")
    print("📡 Server: http://localhost:5000")
    app.run(debug=True, port=5000)