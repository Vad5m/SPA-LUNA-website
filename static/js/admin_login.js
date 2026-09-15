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

document
    .getElementById("togglePassword")
    .addEventListener("click", function () {
        const passwordInput = document.getElementById("password");
        const icon = this.querySelector("i");

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
        } else {
            passwordInput.type = "password";
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        }
    });

document.addEventListener("DOMContentLoaded", function () {
    createStars();
    createFloatingElements();

    document.getElementById("username").focus();
});
