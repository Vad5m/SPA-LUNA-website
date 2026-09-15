function showPhoneModal() {
    document.getElementById("phoneModal").style.display = "block";
}

function closePhoneModal() {
    document.getElementById("phoneModal").style.display = "none";
}

window.onclick = function (event) {
    const modal = document.getElementById("phoneModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
};
