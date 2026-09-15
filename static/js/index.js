document.addEventListener("DOMContentLoaded", function () {
    const carousels = document.querySelectorAll(".carousel-container");

    carousels.forEach((carousel) => {
        const track = carousel.querySelector(".carousel-track");
        const prevBtn = carousel.querySelector(".prev");
        const nextBtn = carousel.querySelector(".next");

        if (!track || !prevBtn || !nextBtn) return;

        let currentIndex = 0;
        const items = track.children;
        const itemsCount = items.length;

        function updateCarousel() {
            const itemWidth = items[0].offsetWidth;
            const newTransform = -currentIndex * itemWidth;
            track.style.transform = `translateX(${newTransform}px)`;

            if (prevBtn) {
                prevBtn.style.opacity = currentIndex === 0 ? "0.5" : "1";
                prevBtn.style.cursor =
                    currentIndex === 0 ? "not-allowed" : "pointer";
            }
            if (nextBtn) {
                nextBtn.style.opacity =
                    currentIndex >= itemsCount - 1 ? "0.5" : "1";
                nextBtn.style.cursor =
                    currentIndex >= itemsCount - 1
                        ? "not-allowed"
                        : "pointer";
            }
        }

        prevBtn.addEventListener("click", () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });

        nextBtn.addEventListener("click", () => {
            if (currentIndex < itemsCount - 1) {
                currentIndex++;
                updateCarousel();
            }
        });

        window.addEventListener("resize", () => {
            updateCarousel();
        });

        updateCarousel();
    });
});
