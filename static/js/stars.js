function createStars() {
    const starsContainer = document.getElementById("stars");

    for (let i = 0; i < 100; i++) {
        const star = document.createElement("div");
        star.className = "star";

        const size = Math.random() * 3 + 1;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 3;
        const duration = Math.random() * 3 + 2;

        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${left}%`;
        star.style.top = `${top}%`;
        star.style.animationDelay = `${delay}s`;
        star.style.animationDuration = `${duration}s`;

        starsContainer.appendChild(star);
    }
}

function createFloatingElements() {
    const container = document.getElementById("floatingElements");
    const elements = ["●", "◆", "▲", "✦", "■", "♦"];

    for (let i = 0; i < 20; i++) {
        const element = document.createElement("div");
        element.className = "floating-element";
        element.textContent =
            elements[Math.floor(Math.random() * elements.length)];

        const size = Math.random() * 15 + 8;
        const left = Math.random() * 100;
        const delay = Math.random() * 15;
        const duration = Math.random() * 20 + 10;
        const opacity = Math.random() * 0.2 + 0.05;

        element.style.width = `${size}px`;
        element.style.height = `${size}px`;
        element.style.left = `${left}%`;
        element.style.top = `${100 + Math.random() * 20}%`;
        element.style.animationDelay = `${delay}s`;
        element.style.animationDuration = `${duration}s`;
        element.style.opacity = opacity;
        element.style.fontSize = `${size}px`;
        element.style.color = `rgba(255, 255, 255, ${opacity})`;

        container.appendChild(element);
    }
}

class UFOSystem {
    constructor() {
        this.container = document.createElement("div");
        this.container.className = "ufo-system";
        document.body.appendChild(this.container);

        this.trailContainer = document.createElement("div");
        this.trailContainer.className = "trail-container";
        this.container.appendChild(this.trailContainer);

        this.ufo = null;
        this.isFlying = false;
        this.hasStarted = false;
    }

    createUFO() {
        if (this.isFlying) return;

        this.ufo = document.createElement("div");
        this.ufo.className = "ufo";
        this.ufo.innerHTML = "➤";
        this.ufo.style.fontSize = "24px";
        this.container.appendChild(this.ufo);

        this.flyUFO();
    }

    flyUFO() {
        this.isFlying = true;
        const startY = 85;
        let startTime = Date.now();
        const duration = 4000;

        const animate = () => {
            const currentTime = Date.now();
            const progress = (currentTime - startTime) / duration;

            if (progress < 0.1) {
                this.ufo.style.opacity = (progress / 0.1).toString();
            } else if (progress > 0.9) {
                this.ufo.style.opacity = ((1 - progress) / 0.1).toString();
            } else {
                this.ufo.style.opacity = "1";
            }

            if (progress > 1) {
                this.ufo.remove();
                this.isFlying = false;
                return;
            }

            const baseX = -30 + progress * (window.innerWidth + 60);
            const shakeX = Math.sin(progress * 50) * 1.5;
            const shakeY = Math.sin(progress * 45) * 1;
            const x = baseX + shakeX;
            const y = startY + shakeY;

            this.ufo.style.left = `${x}px`;
            this.ufo.style.top = `${y}px`;

            this.createTrailParticles(x, y);

            requestAnimationFrame(animate);
        };

        animate();
    }

    createTrailParticles(ufoX, ufoY) {
        const trailX = ufoX - 20;
        const trailY = ufoY + 12;

        if (Math.random() > 0.4) {
            this.createParticle(
                trailX,
                trailY,
                "cube",
                "■",
                -(Math.random() * 40 + 20),
                (Math.random() - 0.5) * 15,
            );
        }

        if (Math.random() > 0.6) {
            this.createParticle(
                trailX,
                trailY,
                "beam",
                "",
                -(Math.random() * 60 + 30),
                (Math.random() - 0.5) * 20,
            );
        }
    }

    createParticle(x, y, type, content, moveX, moveY) {
        const particle = document.createElement("div");
        particle.className = `particle ${type}`;

        if (type === "cube") {
            particle.textContent = content;
            particle.style.fontSize = `${Math.random() * 6 + 4}px`;
            particle.style.color = "#ffffff";
        }

        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.setProperty("--move-x", `${moveX}px`);
        particle.style.setProperty("--move-y", `${moveY}px`);

        this.trailContainer.appendChild(particle);

        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 2000);
    }

    start() {
        setTimeout(() => {
            this.createUFO();
            setInterval(() => {
                this.createUFO();
            }, 60000);
        }, 60000);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    createStars();
    createFloatingElements();

    const ufoSystem = new UFOSystem();
    ufoSystem.start();
});
