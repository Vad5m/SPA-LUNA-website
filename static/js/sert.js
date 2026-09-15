const subscriptionsData = [
    {
        baseName: "Магия тела",
        type: "gold",
        visits: 10,
        price: 30600,
        oldPrice: 36000,
        description:
            "Ручной массаж по маслу. Глубокое расслабление и восстановление тела. 10 сеансов полного релакса.",
        video: "/static/doc_2026-02-24_20-06-43.mp4",
        paymentUrl:
            "https://payment.alfabank.ru/sc/SbqzxvgzdgyRqLCt",
    },
    {
        baseName: "Магия тела",
        type: "silver",
        visits: 5,
        price: 15300,
        oldPrice: 18000,
        description:
            "Ручной массаж по маслу. 5 сеансов для поддержания тонуса и энергии. Скидка 15%!",
        video: "/static/doc_2026-02-24_20-06-43.mp4",
        paymentUrl:
            "https://payment.alfabank.ru/sc/pKheiQUWdgOajigN",
    },
    {
        baseName: "Сияние лица",
        type: "gold",
        visits: 10,
        price: 15300,
        oldPrice: 18000,
        description:
            "Ручной массаж лица. Омоложение, лифтинг, здоровое сияние. Комплекс из 10 процедур.",
        video: "/static/doc_2026-02-24_20-14-09.mp4",
        paymentUrl:
            "https://payment.alfabank.ru/sc/GPQTtndOelpxBIrd",
    },
    {
        baseName: "Сияние лица",
        type: "silver",
        visits: 5,
        price: 7650,
        oldPrice: 9000,
        description:
            "Ручной массаж лица. 5 процедур для свежести и тонуса кожи. Скидка 15%!",
        video: "/static/doc_2026-02-24_20-14-09.mp4",
        paymentUrl:
            "https://payment.alfabank.ru/sc/CmwiwORZfNPeCtal",
    },
    {
        baseName: "Техно-релакс",
        type: "gold",
        visits: 10,
        price: 14450,
        oldPrice: 17000,
        description:
            "Аппаратный массаж тела. Инновационные технологии для глубокой релаксации и восстановления.",
        video: "/static/doc_2026-02-24_20-56-37.mp4",
        paymentUrl:
            "https://payment.alfabank.ru/sc/VINPTYsxSqIVBZtg",
    },
    {
        baseName: "Техно-релакс",
        type: "silver",
        visits: 5,
        price: 7225,
        oldPrice: 8500,
        description:
            "Аппаратный массаж тела. 5 сеансов для восстановления энергии и тонуса. Скидка 15%!",
        video: "/static/doc_2026-02-24_20-56-37.mp4",
        paymentUrl:
            "https://payment.alfabank.ru/sc/geRIhPzgCjsagngD",
    },
    {
        baseName: "Идеальный контур",
        type: "gold",
        visits: 10,
        price: 8500,
        oldPrice: 10000,
        description:
            "Аппаратный массаж лица. Моделирование овала, коррекция контуров, лифтинг-эффект.",
        video: "/static/lv_0_20260402181105.mp4",
        paymentUrl:
            "https://payment.alfabank.ru/sc/ZhsIsbNEKzZnJlko",
    },
    {
        baseName: "Идеальный контур",
        type: "silver",
        visits: 5,
        price: 4250,
        oldPrice: 5000,
        description:
            "Аппаратный массаж лица. 5 процедур для четкого контура и сияния кожи. Скидка 15%!",
        video: "/static/lv_0_20260402181105.mp4",
        paymentUrl:
            "https://payment.alfabank.ru/sc/uOfjkPBlkDJDKxXO",
    },
];

const modalOverlay = document.getElementById("subscriptionModal");
const modalWindow = document.getElementById("modalWindow");
const modalVideoContainer = document.getElementById(
    "modalVideoContainer",
);
const modalTitle = document.getElementById("modalTitle");
const modalVisitsSpan = document.getElementById("modalVisits");
const modalDesc = document.getElementById("modalDesc");
const modalPriceSpan = document.getElementById("modalPrice");
const modalOldPriceSpan = document.getElementById("modalOldPrice");
const paymentMethodContainer = document.getElementById(
    "paymentMethodContainer",
);
const closeCross = document.getElementById("closeModalCross");

function closeModal() {
    modalOverlay.classList.remove("active");
    document.body.style.overflow = "";
    const oldVideo = modalVideoContainer.querySelector("video");
    if (oldVideo) {
        oldVideo.pause();
        oldVideo.src = "";
    }
    modalVideoContainer.innerHTML = "";
    paymentMethodContainer.innerHTML = "";
}

function renderPaymentMethod(paymentUrl) {
    const isMobile = window.innerWidth <= 768;
    paymentMethodContainer.innerHTML = "";
    if (isMobile) {
        const linkBtn = document.createElement("a");
        linkBtn.href = paymentUrl;
        linkBtn.target = "_blank";
        linkBtn.rel = "noopener noreferrer";
        linkBtn.className = "modal-payment-link";
        linkBtn.innerHTML =
            '<i class="fas fa-mobile-alt"></i> Перейти к оплате';
        paymentMethodContainer.appendChild(linkBtn);
    } else {
        const qrBlock = document.createElement("div");
        qrBlock.className = "payment-qr-container";
        qrBlock.innerHTML = `<div id="dynamicQR"></div><div class="payment-qr-hint"><i class="fas fa-camera"></i> Наведите камеру телефона</div>`;
        paymentMethodContainer.appendChild(qrBlock);
        new QRCode(document.getElementById("dynamicQR"), {
            text: paymentUrl,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M,
        });
    }
}

function showModalForSubscription(sub) {
    modalVideoContainer.innerHTML = "";
    const videoElem = document.createElement("video");
    videoElem.autoplay = true;
    videoElem.loop = true;
    videoElem.muted = true;
    videoElem.playsInline = true;
    videoElem.controls = false;
    videoElem.style.width = "100%";
    videoElem.style.display = "block";
    const source = document.createElement("source");
    source.src = sub.video;
    source.type = "video/mp4";
    videoElem.appendChild(source);
    videoElem.onerror = function () {
        modalVideoContainer.innerHTML = `<div class="video-error-message"><i class="fas fa-exclamation-triangle" style="font-size: 40px; margin-bottom: 15px; display: block;"></i>Видео не загрузилось<br><small>${sub.video}</small></div>`;
    };
    modalVideoContainer.appendChild(videoElem);
    const typeLabel =
        sub.type === "gold"
            ? "ЗОЛОТОЙ АБОНЕМЕНТ"
            : "СЕРЕБРЯНЫЙ АБОНЕМЕНТ";
    modalTitle.innerText = `${typeLabel} · ${sub.baseName}`;
    modalVisitsSpan.innerText = `${sub.visits} посещений`;
    modalDesc.innerText = sub.description;
    modalPriceSpan.innerText = `${sub.price.toLocaleString()} ₽`;
    modalOldPriceSpan.innerText = `${sub.oldPrice.toLocaleString()} ₽`;
    modalWindow.classList.remove("gold-modal", "silver-modal");
    modalWindow.classList.add(
        sub.type === "gold" ? "gold-modal" : "silver-modal",
    );
    renderPaymentMethod(sub.paymentUrl);
    modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

function generateSubscriptionButtons() {
    const grid = document.getElementById("subscriptionsGrid");
    grid.innerHTML = "";
    subscriptionsData.forEach((sub) => {
        const btn = document.createElement("button");
        btn.className = `sub-btn ${sub.type}`;
        const typeLabel =
            sub.type === "gold" ? "ЗОЛОТОЙ" : "СЕРЕБРЯНЫЙ";
        let gifBgHtml = "";
        if (sub.type === "gold") {
            gifBgHtml = `<video class="gold-gif-bg" autoplay loop muted playsinline><source src="/static/pixverse_mp4_media_web_ori_d0a06b7e-5bb8-4a03-8cde-3dbcf4e745f4_seed112063817-Picsart-BackgroundRemover.webm" type="video/webm"></video>`;
        }
        btn.innerHTML =
            gifBgHtml +
            `<div class="sub-btn-content"><div class="sub-btn-title">${typeLabel} · ${sub.baseName}</div><div class="sub-btn-details"><span class="sub-btn-visits"><i class="far fa-calendar-check"></i> ${sub.visits} посещений</span><span class="sub-btn-price">${sub.price.toLocaleString()} ₽</span><span class="sub-btn-oldprice">${sub.oldPrice.toLocaleString()} ₽</span></div><div style="font-size:12px; opacity:0.8; margin-top:5px;">${sub.description.substring(0, 60)}${sub.description.length > 60 ? "..." : ""}</div></div>`;
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            showModalForSubscription(sub);
        });
        grid.appendChild(btn);
        if (sub.type === "gold") {
            const videoElem = btn.querySelector(".gold-gif-bg");
            if (videoElem)
                videoElem
                    .play()
                    .catch((e) =>
                        console.log("video play error:", e),
                    );
        }
    });
}

const mainButtonsDiv = document.getElementById("mainButtons");
const certPanel = document.getElementById("certificatePanel");
const subsPanel = document.getElementById("subscriptionsPanel");
const buyCertBtn = document.getElementById("buyCertBtn");
const subscriptionsBtn =
    document.getElementById("subscriptionsBtn");
const backFromCertBtn = document.getElementById("backFromCertBtn");
const backFromSubBtn = document.getElementById("backFromSubBtn");

function showMainButtons() {
    mainButtonsDiv.style.display = "flex";
    certPanel.style.display = "none";
    subsPanel.style.display = "none";
}
function showCertificatePanel() {
    mainButtonsDiv.style.display = "none";
    certPanel.style.display = "block";
    subsPanel.style.display = "none";
    const qrContainer = document.querySelector(
        "#certificatePanel .qr-image-container",
    );
    const mobileLink = document.getElementById("mobilePayLink");
    if (window.innerWidth <= 768) {
        if (qrContainer) qrContainer.style.display = "none";
        if (mobileLink) mobileLink.style.display = "flex";
    } else {
        if (qrContainer) qrContainer.style.display = "flex";
        if (mobileLink) mobileLink.style.display = "none";
    }
}
function showSubscriptionsPanel() {
    mainButtonsDiv.style.display = "none";
    certPanel.style.display = "none";
    subsPanel.style.display = "block";
}
function handleResizeForCert() {
    if (certPanel.style.display === "block") {
        const qrContainer = document.querySelector(
            "#certificatePanel .qr-image-container",
        );
        const mobileLink = document.getElementById("mobilePayLink");
        if (window.innerWidth <= 768) {
            if (qrContainer) qrContainer.style.display = "none";
            if (mobileLink) mobileLink.style.display = "flex";
        } else {
            if (qrContainer) qrContainer.style.display = "flex";
            if (mobileLink) mobileLink.style.display = "none";
        }
    }
}
function bindModalEvents() {
    closeCross.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener("keydown", (e) => {
        if (
            e.key === "Escape" &&
            modalOverlay.classList.contains("active")
        )
            closeModal();
    });
    window.addEventListener("resize", () => {
        if (modalOverlay.classList.contains("active")) {
            const modalTitleText = modalTitle.innerText;
            const foundSub = subscriptionsData.find(
                (s) =>
                    `${s.type === "gold" ? "ЗОЛОТОЙ АБОНЕМЕНТ" : "СЕРЕБРЯНЫЙ АБОНЕМЕНТ"} · ${s.baseName}` ===
                    modalTitleText,
            );
            if (foundSub) renderPaymentMethod(foundSub.paymentUrl);
        }
        handleResizeForCert();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    createStars();
    createFloatingElements();
    generateSubscriptionButtons();
    bindModalEvents();
    buyCertBtn.addEventListener("click", showCertificatePanel);
    subscriptionsBtn.addEventListener(
        "click",
        showSubscriptionsPanel,
    );
    backFromCertBtn.addEventListener("click", showMainButtons);
    backFromSubBtn.addEventListener("click", showMainButtons);
    showMainButtons();
});

function createStars() {
    const starsContainer = document.getElementById("stars");
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 150; i++) {
        const star = document.createElement("div");
        star.className = "star";
        const size = Math.random() * 3 + 1;
        star.style.cssText = `width: ${size}px; height: ${size}px; left: ${Math.random() * 100}%; top: ${Math.random() * 100}%; animation-delay: ${Math.random() * 3}s; animation-duration: ${Math.random() * 3 + 2}s;`;
        fragment.appendChild(star);
    }
    starsContainer.appendChild(fragment);
}

function createFloatingElements() {
    const container = document.getElementById("floatingElements");
    const fragment = document.createDocumentFragment();
    const chars = ["●", "◆", "▲", "✦", "■", "♦"];
    for (let i = 0; i < 15; i++) {
        const el = document.createElement("div");
        el.className = "floating-element";
        el.textContent =
            chars[Math.floor(Math.random() * chars.length)];
        const size = Math.random() * 15 + 8;
        el.style.cssText = `width: ${size}px; height: ${size}px; left: ${Math.random() * 100}%; top: ${100 + Math.random() * 20}%; animation-delay: ${Math.random() * 15}s; animation-duration: ${Math.random() * 20 + 10}s; opacity: ${Math.random() * 0.2 + 0.05}; font-size: ${size}px;`;
        fragment.appendChild(el);
    }
    container.appendChild(fragment);
}
