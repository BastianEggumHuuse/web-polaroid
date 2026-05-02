import http.server
import socketserver

PORT = 8000  # change to whatever port you want

class NgrokHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('ngrok-skip-browser-warning', '1')
        super().end_headers()

with socketserver.TCPServer(("", PORT), NgrokHandler) as httpd:
    print(f"Serving on port {PORT}")
    httpd.serve_forever()