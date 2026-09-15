function createStars() {
    const starsContainer = document.getElementById("stars");
    const fragment = document.createDocumentFragment();
    const numberOfStars = 150;

    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement("div");
        star.className = "star";
        const size = Math.random() * 3 + 1;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 3;
        const duration = Math.random() * 3 + 2;

        star.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${left}%;
            top: ${top}%;
            animation-delay: ${delay}s;
            animation-duration: ${duration}s;
        `;

        fragment.appendChild(star);
    }
    starsContainer.appendChild(fragment);
}

function createFloatingElements() {
    const container = document.getElementById("floatingElements");
    const fragment = document.createDocumentFragment();
    const elements = ["●", "◆", "▲", "✦", "■", "♦"];
    const numberOfElements = 15;

    for (let i = 0; i < numberOfElements; i++) {
        const element = document.createElement("div");
        element.className = "floating-element";
        element.textContent =
            elements[Math.floor(Math.random() * elements.length)];
        const size = Math.random() * 15 + 8;
        const left = Math.random() * 100;
        const delay = Math.random() * 15;
        const duration = Math.random() * 20 + 10;
        const opacity = Math.random() * 0.2 + 0.05;

        element.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${left}%;
            top: ${100 + Math.random() * 20}%;
            animation-delay: ${delay}s;
            animation-duration: ${duration}s;
            opacity: ${opacity};
            font-size: ${size}px;
            color: rgba(255, 255, 255, ${opacity});
        `;

        fragment.appendChild(element);
    }
    container.appendChild(fragment);
}

function getIdFromUrl() {
    const path = window.location.pathname;
    const parts = path.split("/");
    for (let part of parts) {
        if (/^\d+$/.test(part)) {
            return part;
        }
    }
    return "123";
}

async function loadData() {
    const id = getIdFromUrl();
    const apiUrl = `http://127.0.0.1:50001/done_buy/${id}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (data.image) {
            document.getElementById("mainImage").src = data.image;
            document.getElementById("mainImage").style.display = "block";
            document.getElementById("mainImage").alt =
                data.caption || "Картинка";
        }

        if (data.caption) {
            document.getElementById("captionText").textContent = data.caption;
        }

        document.getElementById("loading").style.display = "none";
    } catch (error) {
        console.error("Ошибка загрузки:", error);
        document.getElementById("loading").textContent =
            "Ошибка загрузки данных";

        document.getElementById("mainImage").src =
            `https://via.placeholder.com/600x400/333/fff?text=${id}`;
        document.getElementById("mainImage").style.display = "block";
        document.getElementById("captionText").textContent = `${id}`;
        document.getElementById("loading").style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    createStars();
    createFloatingElements();
    loadData();
});
