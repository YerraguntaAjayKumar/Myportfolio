document.addEventListener("DOMContentLoaded", () => {
    fetch("sidebar.html")
        .then(res => res.text())
        .then(html => {
            document.querySelector(".sidebar").innerHTML = html;
        })
        .catch(err => console.error("Navbar load error:", err));
});
