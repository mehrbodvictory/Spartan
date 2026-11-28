"""Serve Spartan Drill with its account-free multiplayer relay."""
import argparse
from collections import deque
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import re
import secrets
import ssl
from threading import Condition
from time import monotonic
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent
ROUTE = "/sd-relay"
MAX_BODY = 640 * 1024
PEER_ID = re.compile(r"[a-zA-Z0-9_-]{1,80}\Z")
changed = Condition()
peers = {}
sessions = {}


class Session:
    def __init__(self, peer_id):
        self.id = peer_id
        self.token = secrets.token_urlsafe(32)
        self.last = monotonic()
        self.inbox = deque()
        self.inbox_bytes = 0
        self.links = set()

    def post(self, event):
        frame = json.dumps(event, separators=(",", ":"), ensure_ascii=True)
        if len(self.inbox) >= 512 or self.inbox_bytes + len(frame) > 1024 * 1024:
            return False
        self.inbox.append(frame)
        self.inbox_bytes += len(frame)
        return True

    def drain(self):
        frames = list(self.inbox)
        self.inbox.clear()
        self.inbox_bytes = 0
        return "[" + ",".join(frames) + "]"

    def unlink(self, other):
        self.links.discard(other)
        other.links.discard(self)
        other.post({"type": "close", "peer": self.id})

    def close(self):
        sessions.pop(self.token, None)
        peers.pop(self.id, None)
        for other in list(self.links):
            self.unlink(other)


class Handler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    timeout = 20

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def reply(self, status, data=None):
        body = (data or "").encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("X-Spartan-Relay", "1")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if body:
            try:
                self.wfile.write(body)
            except (BrokenPipeError, ConnectionResetError):
                pass

    def owns_origin(self):
        origin = urlsplit(self.headers.get("Origin", ""))
        return origin.scheme in ("http", "https") and origin.netloc == self.headers.get("Host")

    def do_GET(self):
        if self.path == ROUTE:
            self.reply(204)
        elif self.game_file():
            super().do_GET()
        else:
            self.send_error(404)

    def do_HEAD(self):
        if self.game_file():
            super().do_HEAD()
        else:
            self.send_error(404)

    def game_file(self):
        path = urlsplit(self.path).path
        if path in ("/", "/index.html", "/stormfront.html", "/conversion.html", "/style.css"):
            return True
        return re.fullmatch(r"/(?:js|assets)/[a-zA-Z0-9_.-]+\.(?:js|webp)", path)

    def log_request(self, code="-", size="-"):
        if not self.path.startswith(ROUTE) or str(code)[0] not in ("2", "4"):
            super().log_request(code, size)

    def do_POST(self):
        if not self.path.startswith(ROUTE + "/") or not self.owns_origin():
            self.close_connection = True
            self.reply(403)
            return
        action = self.path[len(ROUTE) + 1:]
        try:
            size = int(self.headers.get("Content-Length", "0"))
            if not 0 < size <= MAX_BODY:
                raise ValueError
            body = json.loads(self.rfile.read(size))
        except (ValueError, RecursionError):
            self.close_connection = True
            self.reply(400)
            return

        with changed:
            expired = [s for s in sessions.values() if monotonic() - s.last > 45]
            for s in expired:
                s.close()
            token = self.headers.get("X-Spartan-Session", "")
            session = sessions.get(token)
            if action == "open":
                status, result = self.open_peer(body)
            elif session is None:
                status, result = 410, None
            else:
                session.last = monotonic()
                status, result = self.process(action, session, body)
            changed.notify_all()
        self.reply(status, result)

    @staticmethod
    def open_peer(peer_id):
        if not isinstance(peer_id, str) or not PEER_ID.fullmatch(peer_id):
            return 400, None
        if peer_id in peers:
            return 409, None
        if len(peers) >= 256:
            return 503, None
        session = Session(peer_id)
        peers[peer_id] = sessions[session.token] = session
        return 200, json.dumps(session.token)

    @staticmethod
    def process(action, session, body):
        if action == "poll":
            changed.wait_for(lambda: session.inbox or session.token not in sessions, 10)
            return 200, session.drain()
        if action == "leave":
            session.close()
            return 204, None
        if action != "send" or not isinstance(body, list) or len(body) > 100:
            return 400, None
        for event in body:
            if not isinstance(event, dict):
                continue
            target = event.get("peer")
            if not isinstance(target, str) or target == session.id:
                continue
            peer = peers.get(target)
            kind = event.get("type")
            if kind == "connect":
                if not peer:
                    session.post({"type": "missing", "peer": target})
                elif len(session.links) < 16 and len(peer.links) < 16 and peer not in session.links:
                    binding = secrets.token_urlsafe(24)
                    if peer.post({"type": "connect", "peer": session.id, "binding": binding}):
                        session.links.add(peer)
                        peer.links.add(session)
                        session.post({"type": "open", "peer": target, "binding": binding})
            elif peer in session.links:
                if kind == "close":
                    session.unlink(peer)
                elif kind == "data":
                    frame = event.get("frame")
                    if isinstance(frame, str) and len(frame.encode("utf-8", errors="replace")) <= 128 * 1024:
                        if not peer.post({"type": "data", "peer": session.id, "frame": frame}):
                            session.unlink(peer)
                            session.post({"type": "close", "peer": peer.id})
        return 204, None


if __name__ == "__main__":
    args = argparse.ArgumentParser(description=__doc__)
    args.add_argument("--bind", default="127.0.0.1")
    args.add_argument("--port", type=int, default=8000)
    args.add_argument("--cert")
    args.add_argument("--key")
    options = args.parse_args()
    if bool(options.cert) != bool(options.key):
        args.error("--cert and --key must be provided together")
    with ThreadingHTTPServer((options.bind, options.port), Handler) as server:
        scheme = "http"
        if options.cert:
            tls = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            tls.load_cert_chain(options.cert, options.key)
            server.socket = tls.wrap_socket(server.socket, server_side=True)
            scheme = "https"
        print(f"Spartan Drill relay serving {scheme}://{options.bind}:{options.port}", flush=True)
        server.serve_forever()
