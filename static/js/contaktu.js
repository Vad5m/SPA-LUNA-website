// static/js/contaktu.js
function copyPhoneNumber() {
    const phoneNumber = "+7 (906) 395-42-42";

    navigator.clipboard
        .writeText(phoneNumber)
        .then(function () {
            const phoneElement = document.getElementById("phoneNumber");
            const originalText = phoneElement.textContent;

            phoneElement.textContent = "Скопировано!";
            phoneElement.style.color = "#4CAF50";

            setTimeout(() => {
                phoneElement.textContent = originalText;
                phoneElement.style.color = "white";
            }, 2000);
        })
        .catch(function (err) {
            console.error("Ошибка копирования: ", err);
            alert(
                "Не удалось скопировать номер. Скопируйте вручную: " +
                    phoneNumber,
            );
        });
}

document.addEventListener("DOMContentLoaded", function () {
    const contactItems = document.querySelectorAll(
        ".contact-item, .social-button-large",
    );
    contactItems.forEach((item, index) => {
        item.style.opacity = "0";
        item.style.transform = "translateY(20px)";

        setTimeout(
            () => {
                item.style.transition = "all 0.5s ease";
                item.style.opacity = "1";
                item.style.transform = "translateY(0)";
            },
            100 + index * 100,
        );
    });
});
