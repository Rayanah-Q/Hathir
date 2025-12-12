chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "CHECK_URL") {
        fetch("http://127.0.0.1:8000/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: msg.url })
        })
        .then(res => res.json())
        .then(sendResponse)
        .catch(err => sendResponse({ error: err.toString() }));

        return true; // keeps message channel alive for async response
    }

    if (msg.type === "CLOSE_TAB") {
        chrome.tabs.remove(sender.tab.id);
    }
});
