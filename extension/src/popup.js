// ============================================================
// MESSAGE LISTENER (BACKGROUND-LIKE LOGIC)
// ============================================================
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


// ============================================================
// LOCALIZATION → MATCHES YOUR HTML ELEMENTS
// ============================================================
const ids = [
    "title",
    "text",
    "prompt",
    "actionButton",
    "resultTextSafe",
    "resultTextUnsafe",
    "exitButton",
    "unsafeExitButton",
    "loadingtitle"
];

ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = chrome.i18n.getMessage(id);
});


// ============================================================
// RTL / LTR SUPPORT
// ============================================================
if (navigator.language.startsWith("ar")) {
    document.body.dir = "rtl";
    document.body.style.textAlign = "right";
    document.body.classList.add("arabic-font");
} else {
    document.body.dir = "ltr";
    document.body.style.textAlign = "left";
    document.body.classList.add("default-font");
}


// ============================================================
// CLICK → SCAN THE CURRENT PAGE
// ============================================================
document.getElementById("actionButton").addEventListener("click", () => {

    // Hide main screen, show loading
    document.getElementById("container").classList.add("hidden");
    document.getElementById("loading").classList.remove("hidden");

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const currentURL = tabs[0].url;

        chrome.runtime.sendMessage(
            { type: "CHECK_URL", url: currentURL },
            data => {
                if (!data || data.error) {
                    document.getElementById("loadingtitle").textContent =
                        "ERROR: " + (data?.error ?? "Unknown error");
                    return;
                }

                handleScanResult(data);
            }
        );
    });
});


// ============================================================
// HANDLE SCAN RESULT FROM PYTHON
// ============================================================
function handleScanResult(json) {

    document.getElementById("loading").classList.add("hidden");

    if (json.is_safe === true) {
        showSafeMessage();
    } else {
        showUnsafeMessage();
    }
}


// ============================================================
// SHOW SAFE RESULT
// ============================================================
function showSafeMessage() {
    document.getElementById("safe").classList.remove("hidden");
}


// ============================================================
// SHOW UNSAFE RESULT
// ============================================================
function showUnsafeMessage() {
    document.getElementById("unsafe").classList.remove("hidden");
}


// ============================================================
// BUTTONS
// ============================================================
document.getElementById("exitButton").addEventListener("click", () => {
    window.close();
});

document.getElementById("unsafeExitButton").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "CLOSE_TAB" });
});
