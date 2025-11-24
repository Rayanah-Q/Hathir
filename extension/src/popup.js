    
    document.addEventListener("DOMContentLoaded", () => {
    const title = document.getElementById("title");
    const text = document.getElementById("text");
    const prompt = document.getElementById("prompt");
    const actionButton = document.getElementById("actionButton");

    title.textContent = chrome.i18n.getMessage("title");
    text.textContent = chrome.i18n.getMessage("text");
    prompt.textContent = chrome.i18n.getMessage("prompt");
    actionButton.textContent = chrome.i18n.getMessage("actionButton");

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