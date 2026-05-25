#!/usr/bin/env python3
"""Simple HTTP server for mobile access - shows connection info on splash"""
import http.server
import socket
import os

PORT = 8000
DIR = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            # Inject mobile URL into splash screen
            hostname = socket.gethostname()
            try:
                local_ip = socket.gethostbyname(hostname)
            except:
                local_ip = '192.168.x.x'
            mobile_url = f"http://{local_ip}:{PORT}"

            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            # Read and inject
            index_path = os.path.join(DIR, "index.html")
            with open(index_path, "rb") as f:
                html = f.read()

            inject = (
                f'<script>'
                f'document.getElementById("splash-tip").innerHTML = '
                f'"手机同一WiFi下打开<br><b style=\'font-size:18px;color:var(--accent);letter-spacing:1px\'>{mobile_url}</b>";'
                f'</script>'
            ).encode('utf-8')
            self.wfile.write(html.replace(b'</body>', inject + b'</body>'))
        else:
            super().do_GET()

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

# Get local IP
hostname = socket.gethostname()
local_ip = socket.gethostbyname(hostname)

print(f"\n{'='*50}")
print(f"  考研背单词 - 本地服务器")
print(f"{'='*50}")
print(f"")
print(f"  [PC端] 浏览器打开:")
print(f"  http://localhost:{PORT}")
print(f"")
print(f"  [手机端] 手机和电脑连同一WiFi后:")
print(f"  http://{local_ip}:{PORT}")
print(f"")
print(f"  或用手机扫码:")
qr_url = f"http://{local_ip}:{PORT}"
print(f"  (生成二维码: https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={qr_url})")
print(f"")
print(f"  Ctrl+C 停止服务器")
print(f"{'='*50}\n")

server = http.server.HTTPServer(("0.0.0.0", PORT), Handler)
server.serve_forever()
