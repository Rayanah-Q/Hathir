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
    "loadingTitle"
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
    document.getElementById("loading").classList.add("reveal");

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const currentURL = tabs[0].url;

        chrome.runtime.sendMessage(
            { type: "CHECK_URL", url: currentURL },
            data => {
                if (!data || data.error) {
                    document.getElementById("loadingTitle").textContent =
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
    document.getElementById("safe").classList.add("reveal");
}


// ============================================================
// SHOW UNSAFE RESULT
// ============================================================
function showUnsafeMessage() {
    document.getElementById("unsafe").classList.remove("hidden");
    document.getElementById("unsafe").classList.add("reveal");
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
// Fire the URL check immediately when popup opens
window.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url;
        if (!url) return;

        chrome.runtime.sendMessage(
            { type: "CHECK_URL", url },
            (response) => {
                if (!response || response.error) {
                    document.getElementById("resultTextUnsafe").textContent =
                        "Backend connection error.";
                    document.getElementById("unsafe").classList.remove("hidden");
                    return;
                }

                // Handle backend result
                if (response.status === "safe") {
                    document.getElementById("safe").classList.remove("hidden");
                    document.getElementById("loading").classList.add("hidden");
                    document.getElementById("safe").classList.add("reveal");
                }
            }
        );
    });
});
