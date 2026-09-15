document.addEventListener("DOMContentLoaded", function () {
    const tableRows = document.querySelectorAll(".table-row");
    const headers = [
        "Цель обработки",
        "Персональные данные",
        "Правовые основания",
        "Виды обработки персональных данных",
    ];

    tableRows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll(".table-cell");
        cells.forEach((cell, cellIndex) => {
            if (rowIndex > 0 && cellIndex < headers.length) {
                cell.setAttribute("data-label", headers[cellIndex]);
            }
        });
    });
});
