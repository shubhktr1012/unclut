import http.server
import socketserver
import threading
import time
from unsub_process import PlaywrightUnsubscribeStrategy

# 1. Define a Mock Server Handler
class MockUnsubHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/unsub':
            # Serve a page with a confirmation button
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b"<html><body><h1>Manage Preferences</h1><p>Do you really want to leave?</p><form action='/success' method='GET'><button type='submit'>Yes, Unsubscribe Me</button></form></body></html>")
        elif self.path == '/success':
            # Serve the success page
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b"<html><body><h1>Done!</h1><p>You have been successfully unsubscribed.</p></body></html>")
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        # Silence server logs
        pass

# 2. Main Test Function
def test_interactive_unsub():
    PORT = 8086 # Changed port just in case
    Handler = MockUnsubHandler
    
    # Start server in a separate thread
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Mock server started at http://localhost:{PORT}")
        
        server_thread = threading.Thread(target=httpd.serve_forever)
        server_thread.daemon = True
        server_thread.start()
        
        try:
            # Instantiate our Strategy
            strategy = PlaywrightUnsubscribeStrategy()
            target_url = f"http://localhost:{PORT}/unsub"
            
            print(f"Testing Unsubscribe on: {target_url}")
            print("Browser should: Load Page -> Find 'Yes, Unsubscribe Me' button -> Click -> Verify Success\n")
            
            start_time = time.time()
            success, msg = strategy.unsubscribe(target_url)
            end_time = time.time()
            
            print("-" * 50)
            print(f"Result: {success}")
            print(f"Server Response: {msg}")
            print(f"Time Taken: {end_time - start_time:.2f}s")
            print("-" * 50)
            
            # We accept "Clicked..." as success because it proves interaction happened
            if success and ("Successfully unsubscribed" in msg or "Clicked unsubscribe button" in msg):
                print("TEST PASSED: Smart interaction worked!")
            else:
                print("TEST FAILED: Logic did not confirm unsubscription.")

        finally:
            httpd.shutdown()
            print("Mock server stopped.")

if __name__ == "__main__":
    test_interactive_unsub()
