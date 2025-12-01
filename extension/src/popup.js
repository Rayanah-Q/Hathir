// -------------------------------------------
// LOCALIZATION
// -------------------------------------------
const ids = [
    "title",
    "text",
    "prompt",
    "actionButton",
    "resultTitle",
    "resultTextSafe",
    "resultTextUnsafe",
    "exitButton",
    "unsafeExitButton"
];

ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = chrome.i18n.getMessage(id);
});


// -------------------------------------------
// RTL / LTR SUPPORT
// -------------------------------------------
if (navigator.language.startsWith("ar")) {
    document.body.dir = "rtl";
    document.body.style.textAlign = "right";
    document.body.classList.add("arabic-font");
} else {
    document.body.dir = "ltr";
    document.body.style.textAlign = "left";
    document.body.classList.add("default-font");
}


// -------------------------------------------
// CLICK → SCAN CURRENT PAGE
// -------------------------------------------
document.getElementById("actionButton").addEventListener("click", () => {

    // Hide main screen, show results section
    document.getElementById("container").classList.add("hidden");
    document.getElementById("results").classList.remove("hidden");
    document.getElementById("results").classList.add("reveal");

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const currentURL = tabs[0].url;

        chrome.runtime.sendMessage(
            { type: "CHECK_URL", url: currentURL },
            data => {
                if (!data || data.error) {
                    document.getElementById("resultTitle").textContent =
                        "ERROR: " + (data?.error ?? "Unknown error");
                    return;
                }

                handleScanResult(data); // Pass full JSON from Python
            }
        );
    });
});


// -------------------------------------------
// HANDLE JSON FROM PYTHON
// Uses: json.is_safe
// -------------------------------------------
function handleScanResult(json) {
    const resultTitle = document.getElementById("resultTitle");

    if (json.is_safe === true) {
        showSafeMessage();
    } else {

        // Optionally show similarity details
        if (json.best_match && json.best_match.similarity !== undefined) {
            resultTitle.textContent += `\nSimilarity: ${json.best_match.similarity}%`;
        }

        showUnsafeMessage();
    }
}


// -------------------------------------------
// SHOW SAFE RESULT
// -------------------------------------------
function showSafeMessage() {
    document.getElementById("resultTextSafe").classList.remove("hidden");
    document.getElementById("exitButton").classList.remove("hidden");

    document.getElementById("resultTextUnsafe").classList.add("hidden");
    document.getElementById("unsafeExitButton").classList.add("hidden");
}


// -------------------------------------------
// SHOW UNSAFE RESULT
// -------------------------------------------
function showUnsafeMessage() {
    document.getElementById("resultTextUnsafe").classList.remove("hidden");
    document.getElementById("unsafeExitButton").classList.remove("hidden");

    document.getElementById("resultTextSafe").classList.add("hidden");
    document.getElementById("exitButton").classList.add("hidden");
}


// -------------------------------------------
// SAFE EXIT BUTTON
// -------------------------------------------
document.getElementById("exitButton").addEventListener("click", () => {
    window.close();
});


// -------------------------------------------
// UNSAFE EXIT BUTTON → CLOSE TAB
// -------------------------------------------
document.getElementById("unsafeExitButton").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "CLOSE_TAB" });
});