from unsub_process import PlaywrightUnsubscribeStrategy

def test_playwright_strategy():
    strategy = PlaywrightUnsubscribeStrategy()
    
    # Test with a known "success" page (example.com is safe, though won't trigger unsub success)
    # We just want to verifying browser launches and navigates without crashing
    print("Launching Playwright...")
    try:
        success, message = strategy.unsubscribe("https://example.com")
        print(f"Result: Success={success}, Message={message}")
        if "Could not verify unsubscription" in message:
             print("PASS: Browser navigated correctly (failure expected on example.com)")
        else:
             print(f"Unexpected result: {message}")

    except Exception as e:
        print(f"FAIL: {e}")

if __name__ == "__main__":
    test_playwright_strategy()
