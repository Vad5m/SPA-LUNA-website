// create_comment.js
function initTelegramAuth() {
    const loading = document.getElementById("loading");
    const error = document.getElementById("error");

    loading.style.display = "block";
    error.style.display = "none";

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute(
        "data-telegram-login",
        "{{ bot_username }}",
    );
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "onTelegramAuth");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    script.onload = function () {
        loading.style.display = "none";
    };

    script.onerror = function () {
        loading.style.display = "none";
        showError("Ошибка загрузки виджета Telegram");
    };

    document
        .getElementById("telegram-login-container")
        .appendChild(script);
}

window.onTelegramAuth = function (user) {
    const loading = document.getElementById("loading");
    const error = document.getElementById("error");

    loading.style.display = "block";
    error.style.display = "none";

    fetch("/auth/telegram", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
    })
        .then((response) => response.json())
        .then((data) => {
            loading.style.display = "none";

            if (data.success) {
                window.location.href = data.redirect;
            } else {
                showError(data.error || "Ошибка авторизации");
            }
        })
        .catch((err) => {
            loading.style.display = "none";
            showError("Ошибка соединения с сервером");
        });
};

function showError(message) {
    const error = document.getElementById("error");
    error.textContent = message;
    error.style.display = "block";
}

document.addEventListener("DOMContentLoaded", function () {
});
