function createStars() {
    const starsContainer = document.getElementById("stars");
    const fragment = document.createDocumentFragment();
    const numberOfStars = 130;
    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement("div");
        star.className = "star";
        const size = Math.random() * 3 + 1;
        star.style.cssText = `width: ${size}px; height: ${size}px; left: ${Math.random() * 100}%; top: ${Math.random() * 100}%;`;
        fragment.appendChild(star);
    }
    starsContainer.appendChild(fragment);
}

function createFloatingElements() {
    if (window.innerWidth <= 768) {
        return;
    }
    const container = document.getElementById("floatingElements");
    if (!container) return;
    const symbols = ["●", "◆", "▲", "✦", "■", "♦", "♢"];
    for (let i = 0; i < 24; i++) {
        const el = document.createElement("div");
        el.className = "floating-element";
        el.textContent =
            symbols[Math.floor(Math.random() * symbols.length)];
        const size = Math.random() * 18 + 8;
        const opacity = Math.random() * 0.25 + 0.05;
        el.style.cssText = `width: ${size}px; height: ${size}px; left: ${Math.random() * 100}%; top: ${100 + Math.random() * 40}%; animation-delay: ${Math.random() * 15}s; animation-duration: ${Math.random() * 20 + 12}s; opacity: ${opacity}; font-size: ${size}px; color: rgba(255,255,255,${opacity});`;
        container.appendChild(el);
    }
}

function initCarousels() {
    document
        .querySelectorAll(".carousel-container")
        .forEach((carousel) => {
            const track = carousel.querySelector(".carousel-track");
            const items = track.querySelectorAll(".carousel-item");
            const prevBtn =
                carousel.querySelector(".carousel-btn.prev");
            const nextBtn =
                carousel.querySelector(".carousel-btn.next");
            if (!items.length) return;
            let currentIndex = 0;
            let itemsPerView = getItemsPerView();

            function getItemsPerView() {
                const w = window.innerWidth;
                if (w <= 768) return 1;
                if (w <= 1024) return 2;
                return 3;
            }
            function updateCarousel() {
                const itemWidth =
                    items[0].getBoundingClientRect().width + 25;
                track.style.transform = `translate3d(-${currentIndex * itemWidth}px, 0, 0)`;
            }
            function nextSlide() {
                const maxIndex = items.length - itemsPerView;
                if (currentIndex < maxIndex) currentIndex++;
                else currentIndex = 0;
                updateCarousel();
            }
            function prevSlide() {
                if (currentIndex > 0) currentIndex--;
                else currentIndex = items.length - itemsPerView;
                updateCarousel();
            }
            if (nextBtn)
                nextBtn.addEventListener("click", nextSlide);
            if (prevBtn)
                prevBtn.addEventListener("click", prevSlide);
            let autoScroll;
            if (window.innerWidth > 768) {
                autoScroll = setInterval(nextSlide, 4800);
                carousel.addEventListener("mouseenter", () =>
                    clearInterval(autoScroll),
                );
                carousel.addEventListener("mouseleave", () => {
                    autoScroll = setInterval(nextSlide, 4800);
                });
            }
            window.addEventListener("resize", () => {
                itemsPerView = getItemsPerView();
                currentIndex = 0;
                updateCarousel();
                if (autoScroll) clearInterval(autoScroll);
                if (window.innerWidth > 768)
                    autoScroll = setInterval(nextSlide, 4800);
            });
            updateCarousel();
        });
}

function initMobileMenu() {
    const toggle = document.getElementById("menuToggle");
    const verticalMenu = document.getElementById("verticalMenu");
    if (!toggle || !verticalMenu) return;
    toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        toggle.classList.toggle("active");
        verticalMenu.classList.toggle("active");
    });
    verticalMenu.querySelectorAll(".nav-button").forEach((btn) => {
        btn.addEventListener("click", () => {
            toggle.classList.remove("active");
            verticalMenu.classList.remove("active");
        });
    });
    document.addEventListener("click", (event) => {
        if (
            !toggle.contains(event.target) &&
            !verticalMenu.contains(event.target) &&
            verticalMenu.classList.contains("active")
        ) {
            toggle.classList.remove("active");
            verticalMenu.classList.remove("active");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    createStars();
    createFloatingElements();
    initCarousels();
    initMobileMenu();
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            if (href && href !== "#" && href.length > 1) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }
            }
        });
    });
});
