// galareya.js
function openFullscreen(imageSrc, title, author, date) {
    const modal = document.getElementById("fullscreen-modal");
    const modalImg = document.getElementById("fullscreen-image");
    const modalTitle = document.getElementById("fullscreen-title");
    const modalAuthor = document.getElementById("fullscreen-author");
    const modalDate = document.getElementById("fullscreen-date");

    modal.style.display = "block";
    modalImg.src = imageSrc;
    modalTitle.textContent = title;

    if (author && author.trim() !== "") {
        modalAuthor.textContent = "Автор: " + author;
        modalAuthor.style.display = "block";
    } else {
        modalAuthor.style.display = "none";
    }

    if (date && date.trim() !== "") {
        modalDate.textContent = "Дата: " + date;
        modalDate.style.display = "block";
    } else {
        modalDate.style.display = "none";
    }

    document.body.style.overflow = "hidden";
}

function closeFullscreen() {
    const modal = document.getElementById("fullscreen-modal");
    modal.style.display = "none";
    document.body.style.overflow = "auto";
}

document
    .getElementById("fullscreen-modal")
    .addEventListener("click", function (e) {
        if (e.target === this) {
            closeFullscreen();
        }
    });

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        closeFullscreen();
    }
});
