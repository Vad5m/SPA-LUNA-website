let allReviews = [];
let lazyLoadObserver = null;

function checkAdminAuth() {
    return fetch("/api/admin/check-auth")
        .then((response) => {
            if (response.status === 401 || !response.ok) {
                window.location.href = "/admin/login/";
                return Promise.reject("Not authenticated");
            }
            return response.json();
        })
        .then((data) => {
            if (!data.authenticated) {
                window.location.href = "/admin/login/";
                return Promise.reject("Not authenticated");
            }
            return true;
        });
}

function initLazyLoading() {
    if ("IntersectionObserver" in window) {
        lazyLoadObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const media = entry.target;
                        if (media.dataset.src) {
                            media.src = media.dataset.src;
                            delete media.dataset.src;
                        }
                        if (media.dataset.srcset) {
                            media.srcset = media.dataset.srcset;
                            delete media.dataset.srcset;
                        }
                        media.classList.remove("lazy-media");
                        media.classList.add("loaded");
                        lazyLoadObserver.unobserve(media);
                    }
                });
            },
            {
                rootMargin: "50px 0px",
                threshold: 0.1,
            },
        );
    }
}

function lazyLoadMedia(mediaElement) {
    if (lazyLoadObserver) {
        mediaElement.classList.add("lazy-media");
        lazyLoadObserver.observe(mediaElement);
    } else {
        mediaElement.classList.add("loaded");
    }
}

function openMediaInNewTab(mediaUrl) {
    window.open(mediaUrl, "_blank");
}

function loadReviews() {
    fetch("/api/reviews")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            if (data.success) {
                allReviews = data.reviews;
                renderReviews();
            }
        })
        .catch((error) => {
            console.error("Error loading reviews:", error);
        });
}

function loadAllFiles() {
    fetch("/api/reviews/all-files")
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                renderMediaCarousel(data.files);
            } else {
                loadAllMedia();
            }
        })
        .catch((error) => {
            loadAllMedia();
        });
}

function loadAllMedia() {
    fetch("/api/reviews/all-media")
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                renderMediaCarousel(data.media);
            }
        })
        .catch((error) => {
            console.error("Error loading media:", error);
        });
}

function renderReviews() {
    const reviewsContainer = document.getElementById("reviewsContainer");
    if (!reviewsContainer) return;

    reviewsContainer.innerHTML = "";

    if (allReviews.length === 0) {
        reviewsContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-comments"></i>
            <h3>Пока нет отзывов</h3>
        </div>
    `;
        return;
    }

    allReviews.forEach((review) => {
        const reviewElement = createReviewElement(review);
        reviewsContainer.appendChild(reviewElement);
    });
}

function createReviewElement(review) {
    const reviewDiv = document.createElement("div");
    reviewDiv.className = "review-comment";

    const reviewDate =
        review.date_display ||
        (review.timestamp
            ? new Date(review.timestamp).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
              })
            : "Дата не указана");

    let mediaHTML = "";

    if (review.media_files && review.media_files.length > 0) {
        mediaHTML = `
        <div class="review-media">
            <div class="review-media-carousel">
                <button class="review-media-btn review-media-prev">❮</button>
                <button class="review-media-btn review-media-next">❯</button>
                <div class="review-media-track">
    `;

        review.media_files.forEach((media, index) => {
            if (media.url && media.url !== "undefined") {
                if (media.type === "image") {
                    mediaHTML += `
                    <div class="review-media-item" onclick="openMediaInNewTab('${media.url}')">
                        <img data-src="${media.url}"
                             alt="Фото ${index + 1} от ${review.user_name}"
                             class="lazy-media"
                             onerror="this.style.display='none'" />
                        <div class="lazy-loading-placeholder" style="width:100%;height:100%;">
                            <i class="fas fa-image"></i>
                        </div>
                    </div>
                `;
                } else {
                    mediaHTML += `
                    <div class="review-media-item" onclick="openMediaInNewTab('${media.url}')">
                        <video class="lazy-media"
                               data-src="${media.url}"
                               onerror="this.style.display='none'">
                            Ваш браузер не поддерживает видео.
                        </video>
                        <div class="lazy-loading-placeholder" style="width:100%;height:100%;">
                            <i class="fas fa-video"></i>
                        </div>
                    </div>
                `;
                }
            }
        });

        mediaHTML += `
                </div>
            </div>
        </div>
    `;
    }

    reviewDiv.innerHTML = `
    <div class="review-header">
        <button class="delete-review-btn" onclick="deleteReview(${review.id})">
            ×
        </button>
        <div class="review-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="reviewer-info">
            <div class="reviewer-name">${review.user_name || "Анонимный пользователь"}</div>
            <div class="review-date">${reviewDate}</div>
        </div>
    </div>
    ${mediaHTML}
    <div class="review-text">${review.comment || ""}</div>
`;

    if (review.media_files && review.media_files.length > 0) {
        setTimeout(() => {
            initReviewCarousel(reviewDiv);
            initLazyLoadForReview(reviewDiv);
        }, 100);
    }

    return reviewDiv;
}

function deleteReview(reviewId) {
    if (confirm("Вы уверены, что хотите удалить этот отзыв?")) {
        console.log(`Starting delete for review ID: ${reviewId}`);

        fetch(`/api/admin/reviews/delete/${reviewId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                console.log(`Response status: ${response.status}`);

                if (response.status === 401) {
                    alert(
                        "❌ Вы не авторизованы. Перенаправление на страницу входа...",
                    );
                    window.location.href = "/admin/login/";
                    return Promise.reject("Not authenticated");
                }

                if (!response.ok) {
                    return response.text().then((text) => {
                        console.log(`Response text: ${text}`);
                        throw new Error(`HTTP error ${response.status}`);
                    });
                }
                return response.json();
            })
            .then((data) => {
                console.log(`Response data:`, data);
                if (data.success) {
                    alert("✅ Отзыв успешно удален");
                    loadReviews();
                    loadAllFiles();
                } else {
                    alert(
                        "❌ Ошибка при удалении отзыва: " +
                            (data.error || "Неизвестная ошибка"),
                    );
                }
            })
            .catch((error) => {
                console.error("Error deleting review:", error);
                if (error.message !== "Not authenticated") {
                    alert("❌ Ошибка при удалении отзыва: " + error.message);
                }
            });
    }
}

function initLazyLoadForReview(reviewElement) {
    const mediaElements = reviewElement.querySelectorAll(".lazy-media");
    mediaElements.forEach((media) => lazyLoadMedia(media));
}

function initReviewCarousel(reviewElement) {
    const carousel = reviewElement.querySelector(".review-media-carousel");
    if (!carousel) return;

    const track = carousel.querySelector(".review-media-track");
    const items = track.querySelectorAll(".review-media-item");
    const prevBtn = carousel.querySelector(".review-media-prev");
    const nextBtn = carousel.querySelector(".review-media-next");

    if (items.length === 0) return;

    let currentIndex = 0;
    const itemsPerView = getReviewItemsPerView();

    function getReviewItemsPerView() {
        const width = window.innerWidth;
        if (width <= 480) return 2;
        if (width <= 768) return 3;
        if (width <= 1024) return 3;
        return 4;
    }

    function updateCarousel() {
        if (items.length === 0) return;

        const itemWidth = items[0].offsetWidth;
        const gap = 10;
        const translateX = currentIndex * (itemWidth + gap);
        track.style.transform = `translateX(-${translateX}px)`;
    }

    function nextSlide() {
        const maxIndex = Math.max(0, items.length - itemsPerView);
        if (currentIndex < maxIndex) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        updateCarousel();
    }

    function prevSlide() {
        const maxIndex = Math.max(0, items.length - itemsPerView);
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = maxIndex;
        }
        updateCarousel();
    }

    if (nextBtn) nextBtn.addEventListener("click", nextSlide);
    if (prevBtn) prevBtn.addEventListener("click", prevSlide);

    setTimeout(() => {
        updateCarousel();
    }, 100);

    let resizeTimeout;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            currentIndex = 0;
            setTimeout(() => {
                updateCarousel();
            }, 50);
        }, 100);
    });
}

function renderMediaCarousel(files) {
    const carouselTrack = document.getElementById("mediaCarouselTrack");
    if (!carouselTrack) return;

    carouselTrack.innerHTML = "";

    if (files.length === 0) {
        carouselTrack.innerHTML = `
        <div class="empty-state" style="width: 100%; text-align: center; color: rgba(255,255,255,0.7); padding: 40px 20px;">
            <i class="fas fa-images"></i>
            <div style="margin-top: 10px;">Пока нет медиафайлов</div>
        </div>
    `;
        return;
    }

    files.forEach((file) => {
        const carouselItem = document.createElement("div");
        carouselItem.className = "media-carousel-item";
        carouselItem.onclick = () => openMediaInNewTab(file.url);

        if (file.type === "image") {
            carouselItem.innerHTML = `
            <img data-src="${file.url}"
                 alt="Фото из отзыва"
                 class="media-carousel-image lazy-media"
                 onerror="this.style.display='none'" />
            <div class="lazy-loading-placeholder" style="width:100%;height:180px;border-radius:8px;">
                <i class="fas fa-image"></i>
            </div>
            <div class="media-carousel-caption">
                <div class="media-caption-title">Фото</div>
                <div class="media-caption-user">${formatFileSize(file.size)}</div>
            </div>
        `;
        } else {
            carouselItem.innerHTML = `
            <video class="media-carousel-image lazy-media"
                   style="object-fit:cover;"
                   data-src="${file.url}"
                   onerror="this.style.display='none'">
                <source src="${file.url}" type="video/mp4">
                Ваш браузер не поддерживает видео.
            </video>
            <div class="lazy-loading-placeholder" style="width:100%;height:180px;border-radius:8px;">
                <i class="fas fa-video"></i>
            </div>
            <div class="media-carousel-caption">
                <div class="media-caption-title">Видео</div>
                <div class="media-caption-user">${formatFileSize(file.size)}</div>
            </div>
        `;
        }

        carouselTrack.appendChild(carouselItem);
    });

    setTimeout(() => {
        initMediaCarousel();
        initLazyLoadForCarousel();
    }, 100);
}

function initLazyLoadForCarousel() {
    const carouselItems = document.querySelectorAll(
        ".media-carousel-item .lazy-media",
    );
    carouselItems.forEach((media) => lazyLoadMedia(media));
}

function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return "";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function initMediaCarousel() {
    const carousel = document.querySelector(
        ".all-media-section .carousel-container",
    );
    if (!carousel) return;

    const track = carousel.querySelector(".carousel-track");
    const items = track.querySelectorAll(".media-carousel-item");
    const prevBtn = carousel.querySelector(".carousel-btn.prev");
    const nextBtn = carousel.querySelector(".carousel-btn.next");

    if (items.length === 0) return;

    let currentIndex = 0;
    let itemsPerView = getMediaItemsPerView();
    let autoScrollInterval;
    let isHovered = false;
    const isMobile = window.innerWidth <= 768;

    function getMediaItemsPerView() {
        const width = window.innerWidth;
        if (width <= 480) return 2;
        if (width <= 768) return 3;
        if (width <= 1024) return 4;
        if (width <= 1200) return 5;
        return 6;
    }

    function updateCarousel() {
        if (items.length === 0) return;

        const containerWidth = carousel.offsetWidth;
        const itemWidth = items[0].offsetWidth;
        const gap = parseInt(window.getComputedStyle(track).gap) || 15;

        const totalItemWidth = itemWidth + gap;
        const translateX = currentIndex * totalItemWidth;

        track.style.transform = `translateX(-${translateX}px)`;
        track.style.transition = "transform 0.5s ease";
    }

    function nextSlide() {
        const maxIndex = Math.max(0, items.length - itemsPerView);
        if (currentIndex < maxIndex) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        updateCarousel();
    }

    function prevSlide() {
        const maxIndex = Math.max(0, items.length - itemsPerView);
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = maxIndex;
        }
        updateCarousel();
    }

    function startAutoScroll() {
        if (isMobile) return;
        stopAutoScroll();
        autoScrollInterval = setInterval(() => {
            if (!isHovered) nextSlide();
        }, 3000);
    }

    function stopAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }
    }

    if (nextBtn) nextBtn.addEventListener("click", nextSlide);
    if (prevBtn) prevBtn.addEventListener("click", prevSlide);

    if (!isMobile) {
        carousel.addEventListener("mouseenter", () => {
            isHovered = true;
            stopAutoScroll();
        });
        carousel.addEventListener("mouseleave", () => {
            isHovered = false;
            startAutoScroll();
        });
    }

    setTimeout(() => {
        updateCarousel();
        startAutoScroll();
    }, 100);

    let resizeTimeout;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            itemsPerView = getMediaItemsPerView();
            currentIndex = 0;
            setTimeout(() => {
                updateCarousel();
            }, 50);
            stopAutoScroll();
            if (!isMobile) startAutoScroll();
        }, 100);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    checkAdminAuth()
        .then(() => {
            initLazyLoading();
            loadReviews();
            loadAllFiles();
        })
        .catch((error) => {
            console.error("Admin auth failed:", error);
        });
});
