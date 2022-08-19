#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
from lib import ehook
from lib.log import log

import requests
log("OKAY", "Imported: requests")

from threading import Thread
log("OKAY", "Imported: threading.Thread")

from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
log("OKAY", "Imported: http.server")

HRSERVER = f"http://{sys.argv[1]}:12345"
PORT = 21727

class MyServer(Thread):
	class MyHTTPHandler(SimpleHTTPRequestHandler):
		def log_message(self, logFormat, *args):
			try:
				if (int(args[0]) >= 400):
					log("WARN", f"HTTP {int(args[0])} {args[1]} {self.path}")
					return
			except ValueError:
				return

			if (int(args[1]) >= 400):
				log("WARN", f"{args[0]} >>> HTTP {args[1]}")

		def do_GET(self):
			if (self.path == "/bpm"):
				try:
					bpm = requests.get(f"{HRSERVER}/hr")
					self.send_response(200)
					self.end_headers()
					self.wfile.write(bytes(bpm.text, "utf-8"))
				except Exception:
					self.send_response(200)
					self.end_headers()
					self.wfile.write(bytes("-1", "utf-8"))
				return

			return SimpleHTTPRequestHandler.do_GET(self)

	def run(self):
		log("INFO", f"HTTP Server Will Start At Port {PORT}")
		self.server = ThreadingHTTPServer(("", PORT), self.MyHTTPHandler)
		self.server.serve_forever()
	
	def stop(self):
		self.server.shutdown()
		log("INFO", f"HTTP Server Stopped")

server = MyServer()
server.start()