import os
import json
import ssl
import socket
from urllib.parse import urlparse
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import tldextract

app = Flask(__name__)
CORS(app)

def load_trusted_websites(path="trusted_websites.txt"):
    if not os.path.exists(path):
        return []
    with open(path, "r") as f:
        return [line.strip() for line in f if line.strip()]

def fetch_site(url):
    try:
        resp = requests.get(url, timeout=10)
        return {
            "reachable": True,
            "status_code": resp.status_code,
            "html": resp.text,
            "headers": dict(resp.headers)
        }
    except Exception as e:
        return {"reachable": False, "error": str(e)}

def analyze_html(html):
    soup = BeautifulSoup(html, "html.parser")
    return {
        "title": soup.title.string.strip() if soup.title else "",
        "meta_description": soup.find("meta", {"name": "description"}).get("content") 
                            if soup.find("meta", {"name": "description"}) else "",
        "links": [a.get("href") for a in soup.find_all("a") if a.get("href")],
        "scripts": [s.get("src") for s in soup.find_all("script") if s.get("src")]
    }

def get_ssl_info(url):
    try:
        hostname = urlparse(url).hostname
        ctx = ssl.create_default_context()
        with socket.create_connection((hostname, 443)) as sock:
            with ctx.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
        return {
            "issuer": dict(x[0] for x in cert.get("issuer", [])),
            "subject": dict(x[0] for x in cert.get("subject", [])),
            "notBefore": cert.get("notBefore"),
            "notAfter": cert.get("notAfter")
        }
    except Exception as e:
        return {"error": str(e)}

def compare_sites(siteA, siteB):
    score = 0
    checks = {}
    checks["title_match"] = siteA["html_info"]["title"] == siteB["html_info"]["title"]
    if checks["title_match"]: score += 1
    checks["meta_desc_match"] = siteA["html_info"]["meta_description"] == siteB["html_info"]["meta_description"]
    if checks["meta_desc_match"]: score += 1
    checks["scripts_similarity"] = abs(len(siteA["html_info"]["scripts"]) - len(siteB["html_info"]["scripts"])) <= 3
    if checks["scripts_similarity"]: score += 1
    checks["ssl_issuer_match"] = (siteA["ssl"].get("issuer") == siteB["ssl"].get("issuer"))
    if checks["ssl_issuer_match"]: score += 1
    return {
        "score": score,
        "match_percentage": (score / 4) * 100,
        "checks": checks
    }

 

@app.route("/check", methods=["POST"])
def check_site():
    data = request.get_json()
    url = data.get("url", "")
    
    if not url:
        return jsonify({"error": "No URL provided"}), 400
    
    trusted_sites = load_trusted_websites()
    domain = url.replace("https://", "").replace("http://", "").split("/")[0]
    is_trusted = any(domain in trusted for trusted in trusted_sites)
    
    return jsonify({
        "input_url": url,
        "domain": domain,
        "is_trusted": is_trusted,
        "trusted_sites": trusted_sites,
        "comparisons": [{"trusted": site, "match": domain in site} for site in trusted_sites]
    })

# إذا عندك /test تبقى هنا، أو if __name__ مباشرة
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000, debug=True)