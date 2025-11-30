import os
import ssl
import socket
from urllib.parse import urlparse
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)
CORS(app)

# ----------------------------------------------------
#  Load trusted websites
# ----------------------------------------------------
def load_trusted_websites(path="trusted_websites.txt"):
    if not os.path.exists(path):
        return []
    with open(path, "r") as f:
        return [line.strip() for line in f if line.strip()]


# ----------------------------------------------------
#  Fetch website HTML
# ----------------------------------------------------
def fetch_html(url):
    try:
        r = requests.get(url, timeout=8)
        return r.text
    except:
        return ""


# ----------------------------------------------------
#  Extract simple HTML fingerprint
# ----------------------------------------------------
def fingerprint_html(html):
    soup = BeautifulSoup(html, "html.parser")

    title = soup.title.string.strip() if soup.title else ""
    meta_desc = ""
    m = soup.find("meta", {"name": "description"})
    if m:
        meta_desc = m.get("content", "")

    total_links = len(soup.find_all("a"))
    total_scripts = len(soup.find_all("script"))

    return {
        "title": title,
        "meta": meta_desc,
        "links": total_links,
        "scripts": total_scripts,
    }


# ----------------------------------------------------
#  Extract SSL certificate info
# ----------------------------------------------------
def get_ssl_issuer(url):
    try:
        hostname = urlparse(url).hostname
        ctx = ssl.create_default_context()

        with socket.create_connection((hostname, 443), timeout=5) as sock:
            with ctx.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()

        return cert.get("issuer", [])
    except:
        return []


# ----------------------------------------------------
#  Compare two fingerprints
# ----------------------------------------------------
def compare_fingerprints(target, trusted):
    score = 0
    total = 4  # ← عدد الفحوص

    if target["title"] == trusted["title"]:
        score += 1

    if target["meta"] == trusted["meta"]:
        score += 1

    if abs(target["links"] - trusted["links"]) <= 5:
        score += 1

    if target["issuer"] == trusted["issuer"]:
        score += 1

    percentage = (score / total) * 100
    return round(percentage, 2)


# ----------------------------------------------------
# API: /check
# ----------------------------------------------------
@app.route("/check", methods=["POST"])
def check_site():

    data = request.get_json()
    url = data.get("url", "")

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    # Load trusted list
    trusted_sites = load_trusted_websites()

    # Gather fingerprint for visited site
    html = fetch_html(url)
    fp_target = fingerprint_html(html)
    fp_target["issuer"] = get_ssl_issuer(url)

    results = []

    for site in trusted_sites:
        html_trusted = fetch_html(site)
        fp_trusted = fingerprint_html(html_trusted)
        fp_trusted["issuer"] = get_ssl_issuer(site)

        similarity = compare_fingerprints(fp_target, fp_trusted)

        results.append({
            "trusted_site": site,
            "similarity": similarity
        })

    # highest similarity found
    best_match = max(results, key=lambda x: x["similarity"]) if results else None
    is_safe = best_match["similarity"] >= 90 if best_match else False

    return jsonify({
        "url": url,
        "is_safe": is_safe,
        "best_match": best_match,
        "all_results": results
    })


# ----------------------------------------------------
# Run server
# ----------------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
