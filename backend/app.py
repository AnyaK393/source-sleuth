from flask import Flask, request, jsonify
import json
import os

app = Flask(__name__)

# Add CORS headers manually
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response

# Get the absolute path to the data folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')

print(f"📁 Looking for data in: {DATA_DIR}")

def load_article_data(article_id):
    """Load pre-analyzed article data from JSON files"""
    data_path = os.path.join(DATA_DIR, f'article_{article_id}.json')
    print(f"📂 Trying to load: {data_path}")
    try:
        with open(data_path, 'r') as f:
            data = json.load(f)
            print(f"✅ Loaded article: {data.get('title', 'Unknown')}")
            return data
    except FileNotFoundError as e:
        print(f"❌ File not found: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON: {e}")
        return None

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Welcome to Source Sleuth API!',
        'data_folder': DATA_DIR,
        'endpoints': {
            '/api/analyze': 'POST - Analyze an article',
            '/api/articles': 'GET - List available articles'
        }
    })

@app.route('/api/analyze', methods=['POST', 'OPTIONS'])
def analyze_article():
    """Main endpoint: receives article URL, returns analysis"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        article_url = data.get('url', '')
        print(f"🔍 Analyzing URL: {article_url}")
        
        # Simple URL mapping for demo
        if 'vaccine' in article_url.lower():
            article_id = 1
        elif 'climate' in article_url.lower() or 'hoax' in article_url.lower():
            article_id = 2
        elif 'election' in article_url.lower() or 'fraud' in article_url.lower():
            article_id = 3
        else:
            article_id = 1  # Default to first article
        
        print(f"📄 Using article ID: {article_id}")
        article_data = load_article_data(article_id)
        
        if article_data:
            return jsonify({
                'success': True,
                'data': article_data
            })
        else:
            return jsonify({
                'success': False,
                'error': f'Article {article_id} not found. Make sure article_1.json, article_2.json, article_3.json exist in the data folder.'
            }), 404
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/articles', methods=['GET'])
def list_articles():
    """Return list of available demo articles"""
    articles = []
    for i in range(1, 4):
        data_path = os.path.join(DATA_DIR, f'article_{i}.json')
        if os.path.exists(data_path):
            with open(data_path, 'r') as f:
                article = json.load(f)
                articles.append({
                    'id': i,
                    'title': article.get('title', f'Article {i}'),
                    'source': article.get('source', 'Unknown')
                })
    return jsonify({'articles': articles})

if __name__ == '__main__':
    print("🚀 Starting Source Sleuth Backend...")
    print(f"📁 Data folder: {DATA_DIR}")
    print("📡 Server running at: http://localhost:5000")
    app.run(debug=True, port=5000)