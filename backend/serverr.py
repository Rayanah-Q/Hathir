from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests

app = Flask(__name__)
CORS(app)

# Load trusted websites
def load_trusted_websites(path="trusted_websites.txt"):
    if not os.path.exists(path):
        return []
    with open(path, "r") as f:
        return [line.strip() for line in f if line.strip()]

# Fetch HTML
def fetch_html(url):
    try:
        r = requests.get(url, timeout=5)
        return r.text
    except:
        return ""

# Compare HTML with trusted sites (simple check)
def is_safe(url):
    trusted_sites = load_trusted_websites()
    html_target = fetch_html(url)

    for site in trusted_sites:
        html_trusted = fetch_html(site)
        if html_target.strip() == html_trusted.strip():
            return True, site

    return False, None

# API endpoint
@app.route("/check", methods=["POST"])
def check_site():
    data = request.get_json()
    url = data.get("url", "")
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    safe, match = is_safe(url)
    return jsonify({
        "url": url,
        "is_safe": safe,
        "best_match": match
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
