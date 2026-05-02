from http.server import HTTPServer, BaseHTTPRequestHandler, SimpleHTTPRequestHandler
import json, base64, os, time

SAVE_DIR = "./received_photos"
PORT = 443

os.makedirs(SAVE_DIR, exist_ok=True)

class Handler(SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self._cors()
        self.send_response(204)
        self.end_headers()

    def do_POST(self):
        if self.path != "/upload":
            self.send_response(404)
            self.end_headers()
            return

        length = int(self.headers["Content-Length"])
        body = json.loads(self.rfile.read(length))

        image_data = body["image"].split(",", 1)[1]
        filename = f"photo_{int(time.time())}.jpg"
        filepath = os.path.join(SAVE_DIR, filename)

        with open(filepath, "wb") as f:
            f.write(base64.b64decode(image_data))

        print(f"✅ Saved: {filename}")

        self.send_response(200)          # 1. status first
        self._cors()                     # 2. then headers
        self.send_header("Content-Type", "application/json")
        self.end_headers()               # 3. end headers last
        self.wfile.write(json.dumps({"ok": True, "filename": filename}).encode())
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def log_message(self, format, *args):
        pass  # silence default logs



print(f"📸 Photo receiver running on {PORT}")

HTTPServer(("0.0.0.0", PORT), Handler).serve_forever()

