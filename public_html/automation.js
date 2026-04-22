
(function() {
    const btn = document.createElement("button");
    btn.innerHTML = "Auto Fill";
    btn.style.position = "fixed";
    btn.style.bottom = "10px";
    btn.style.left = "10px";
    btn.style.zIndex = 10000;
    btn.style.padding = "10px 20px";
    btn.style.backgroundColor = "#4f46e5";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.borderRadius = "5px";
    btn.style.cursor = "pointer";
    btn.onclick = () => {
        let text = "";
        let input = document.getElementById("msgInput");
        let dateInput = document.getElementById("dateInput");
        let fileInput = document.getElementById("fileInput");
        let type = input ? input.type : "text";
        if (document.querySelector(".select-options")) {
             document.querySelector(".select-option").click();
             return;
        } else if (dateInput && dateInput.style.display !== "none") {
            dateInput.value = "1990-01-01";
            document.getElementById("sendBtn").click();
        } else if (fileInput && fileInput.style.display !== "none") {
            alert("Please upload a dummy file manually, then re-click Auto Fill.");
        } else {
            input.value = "Test Data";
            document.getElementById("sendBtn").click();
        }
    };
    document.body.appendChild(btn);
})();

