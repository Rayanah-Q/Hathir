    document.addEventListener("DOMContentLoaded", () => {
    const title = document.getElementById("title");
    const text = document.getElementById("text");
    const prompt = document.getElementById("prompt");
    const actionButton = document.getElementById("actionButton");
    const resultTitle = document.getElementById("resultTitle");
    const resultTextSafe = document.getElementById("resultTextSafe");
    const resultTextUnsafe = document.getElementById("resultTextUnsafe");
    const exitButton = document.getElementById("exitButton");
    const unsafeExitButton = document.getElementById("unsafeExitButton");
    
    title.textContent = chrome.i18n.getMessage("title");
    text.textContent = chrome.i18n.getMessage("text");
    prompt.textContent = chrome.i18n.getMessage("prompt");
    actionButton.textContent = chrome.i18n.getMessage("actionButton");
    resultTitle.textContent = chrome.i18n.getMessage("resultTitle");
    resultTextSafe.textContent = chrome.i18n.getMessage("resultTextSafe");
    resultTextUnsafe.textContent = chrome.i18n.getMessage("resultTextUnsafe");
    exitButton.textContent = chrome.i18n.getMessage("exitButton");
    unsafeExitButton.textContent = chrome.i18n.getMessage("unsafeExitButton");

if (navigator.language.startsWith ("ar")){
    document.body.dir = "rtl";
    document.body.style.textAlign = "right";
} else {
    document.body.dir = "ltr";
    document.body.style.textAlign = "left";
}
});
console.log("Popup loaded and localized.");
console.log("Current language:", navigator.language);
console.log(chrome.i18n.getMessage("title"));

var button = document.getElementById("actionButton");
button.addEventListener("click", function() {
    document.getElementById("container").classList.add("hidden");
    document.getElementById("results").classList.remove("hidden");
});
function showUnsafeMessage() {
    document.getElementById("resultTextUnsafe").classList.remove("unsafeHidden");
    document.getElementById("unsafeExitButton").classList.remove("unsafeHidden");
    document.getElementById("resultTextSafe").classList.add("unsafeHidden");
    document.getElementById("exitButton").classList.add("unsafeHidden");
}
var exitBtn = document.getElementById("exitButton");
exitBtn.addEventListener("click", function() {
    window.close();
});
var unsafeExitBtn = document.getElementById("unsafeExitButton");
unsafeExitBtn.addEventListener("click", closeCurrentTab);

function closeCurrentTab() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.remove(tabs[0].id);
    }
);};