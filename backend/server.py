from flask import Flask, jsonify

app = Flask(__name__)

# قراءة المواقع الموثوقة من الملف
with open("trusted_websites.txt", "r") as f:
    trusted_websites = [line.strip() for line in f.readlines()]

# مسار رئيسي للتجربة
@app.route('/')
def home():
    return "Server is running. Trusted websites: " + ", ".join(trusted_websites)

# مسار لتجربة فحص موقع
@app.route('/check/<site>')
def check_site(site):
    if site in trusted_websites:
        return jsonify({"site": site, "status": "trusted"})
    else:
        return jsonify({"site": site, "status": "untrusted"})

if __name__ == "__main__":
    app.run(debug=True)