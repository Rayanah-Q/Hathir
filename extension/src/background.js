chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    // Scan URL
    if (msg.type === "CHECK_URL") {

    fetch("http://127.0.0.1:8000/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: msg.url })
        })
        .then(res => res.json())
        .then(data => sendResponse(data))
        .catch(err => sendResponse({ error: err.toString() }));

        return true; // Keep channel open for async response
    }

    // Close tab
    if (msg.type === "CLOSE_TAB") {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.tabs.remove(tabs[0].id);
        });
    }
});