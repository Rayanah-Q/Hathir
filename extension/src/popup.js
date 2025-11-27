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
    ids.forEach (id => {
        const el = document.getElementById(id);
        el.textContent = chrome.i18n.getMessage(id);
    });
if (navigator.language.startsWith ("ar")){
    document.body.dir = "rtl";
    document.body.style.textAlign = "right";
    document.body.classList.add("arabic-font");
} else {
    document.body.dir = "ltr";
    document.body.style.textAlign = "left";
    document.body.classList.add("default-font");
}

// switch pop up pages
var button = document.getElementById("actionButton");
button.addEventListener("click", () => {
    document.getElementById("container").classList.add("hidden");
    document.getElementById("results").classList.remove("hidden");
    document.getElementById("results").classList.add("reveal");
    
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        const currentURL = tabs[0].url;

    fetch ("http://127.0.0.1:5000/check", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({url: currentURL})
    })
    .then (res => res.json())
    .then (data => {
        document.getElementById("resultTitle").textContent = JSON.stringify(data, null, 2);
    })
    .catch (err =>{
        document.getElementById("resultTitle").textContent = "ERROR: "+ err;
        });
    });
});

// replace the hidden class between safe &unsafe pop ups
function showUnsafeMessage() {
    document.getElementById("resultTextUnsafe").classList.remove("hidden");
    document.getElementById("unsafeExitButton").classList.remove("hidden");
    document.getElementById("resultTextSafe").classList.add("hidden");
    document.getElementById("exitButton").classList.add("hidden");
}

// exiting pop up window when page is safe
var exitBtn = document.getElementById("exitButton");
exitBtn.addEventListener("click", function() {
    window.close();
});

// closing current tab function
function closeCurrentTab() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.remove(tabs[0].id);
    }
);};
// closing tab on click for unsafe case
var unsafeExitBtn = document.getElementById("unsafeExitButton");
unsafeExitBtn.addEventListener("click", closeCurrentTab);
