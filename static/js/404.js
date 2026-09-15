// Список аудиофайлов из /static/music/
const musicTracks = [
    {
        id: 1,
        title: "Save Room",
        artist: "Boogrov, Atomic Heart",
        src: "/static/music/Boogrov, Atomic Heart - Save Room.mp3",
        duration: "3:45",
    },
    {
        id: 2,
        title: "Inside Nora",
        artist: "Boogrov, Zoanoid, Atomic Heart",
        src: "/static/music/Boogrov, Zoanoid, Atomic Heart - Inside Nora.mp3",
        duration: "4:20",
    },
    {
        id: 3,
        title: "Стрекоза",
        artist: "Boogrov, Zoanoid, Atomic Heart",
        src: "/static/music/Boogrov, Zoanoid, Atomic Heart - Стрекоза.mp3",
        duration: "5:10",
    },
    {
        id: 4,
        title: "It's been so long",
        artist: "Gysher",
        src: "/static/music/Gysher - It's been so long.mp3",
        duration: "4:55",
    },
    {
        id: 5,
        title: "Quiet Dive",
        artist: "Øneheart, Atomic Heart",
        src: "/static/music/Øneheart, Atomic Heart - Quiet Dive.mp3",
        duration: "3:30",
    },
];

// Иконки погоды
const WeatherIcons = {
    sunny: `
        <svg viewBox="0 0 24 24" class="weather-icon">
            <circle cx="12" cy="12" r="5" fill="#FFB300" />
            <g fill="#FFB300" opacity="0.7">
                <rect x="11" y="3" width="2" height="4" rx="1" />
                <rect x="11" y="17" width="2" height="4" rx="1" />
                <rect x="3" y="11" width="4" height="2" rx="1" />
                <rect x="17" y="11" width="4" height="2" rx="1" />
                <rect x="5" y="5" width="3" height="3" rx="1" transform="rotate(45 12 12)" />
                <rect x="16" y="5" width="3" height="3" rx="1" transform="rotate(45 12 12)" />
                <rect x="5" y="16" width="3" height="3" rx="1" transform="rotate(45 12 12)" />
                <rect x="16" y="16" width="3" height="3" rx="1" transform="rotate(45 12 12)" />
            </g>
        </svg>
    `,
    rainy: `
        <svg viewBox="0 0 24 24" class="weather-icon">
            <path d="M9 12l-2 4" stroke="#2196F3" stroke-width="2" stroke-linecap="round" />
            <path d="M13 12l-2 4" stroke="#2196F3" stroke-width="2" stroke-linecap="round" />
            <path d="M17 12l-2 4" stroke="#2196F3" stroke-width="2" stroke-linecap="round" />
            <path d="M19 10a7 7 0 10-12 4.3" stroke="#64B5F6" stroke-width="2" fill="#E3F2FD" />
            <path d="M12 3v1" stroke="#64B5F6" stroke-width="2" stroke-linecap="round" />
            <path d="M18.36 5.64l.71.71" stroke="#64B5F6" stroke-width="2" stroke-linecap="round" />
            <path d="M21 12h-1" stroke="#64B5F6" stroke-width="2" stroke-linecap="round" />
        </svg>
    `,
    cloudy: `
        <svg viewBox="0 0 24 24" class="weather-icon">
            <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" fill="#BDBDBD" />
            <circle cx="8" cy="9" r="2" fill="#E0E0E0" />
            <circle cx="14" cy="8" r="3" fill="#E0E0E0" />
            <circle cx="18" cy="8" r="2" fill="#E0E0E0" />
        </svg>
    `,
    snowy: `
        <svg viewBox="0 0 24 24" class="weather-icon">
            <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" fill="#E3F2FD" />
            <path d="M8 16l-1 2" stroke="#90CAF9" stroke-width="1.5" stroke-linecap="round" />
            <path d="M12 16l-1 2" stroke="#90CAF9" stroke-width="1.5" stroke-linecap="round" />
            <path d="M16 16l-1 2" stroke="#90CAF9" stroke-width="1.5" stroke-linecap="round" />
        </svg>
    `,
    default: `
        <svg viewBox="0 0 24 24" class="weather-icon">
            <circle cx="12" cy="12" r="8" fill="#81D4FA" />
            <circle cx="9" cy="9" r="2" fill="#E1F5FE" />
            <circle cx="15" cy="9" r="2.5" fill="#E1F5FE" />
        </svg>
    `,
};

// Функция определения иконки по описанию погоды
function getWeatherIcon(description) {
    const desc = description.toLowerCase();
    if (desc.includes("дождь") || desc.includes("rain")) {
        return WeatherIcons.rainy;
    } else if (desc.includes("облачно") || desc.includes("cloud")) {
        return WeatherIcons.cloudy;
    } else if (desc.includes("снег") || desc.includes("snow")) {
        return WeatherIcons.snowy;
    } else if (
        desc.includes("ясно") ||
        desc.includes("солн") ||
        desc.includes("sunny") ||
        desc.includes("clear")
    ) {
        return WeatherIcons.sunny;
    }
    return WeatherIcons.default;
}

// Таймер для музыкального плеера (3 минуты = 180 секунд)
let musicPlayerSeconds = 180;
const musicPlayerContainer = document.getElementById("music-player-container");

// Таймер для погоды (2 минуты = 120 секунд)
let weatherSeconds = 120;
const weatherContainer = document.getElementById("weather-container");

// Глобальные переменные для аудиоплеера
let audioPlayer = null;
let currentTrackIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let updateInterval = null;
let userInteracted = false;

function startMusicPlayerTimer() {
    if (musicPlayerSeconds > 0) {
        musicPlayerSeconds--;
        setTimeout(startMusicPlayerTimer, 1000);
    } else {
        // Время вышло, показываем музыкальный плеер
        showMusicPlayer();
    }
}

function startWeatherTimer() {
    if (weatherSeconds > 0) {
        weatherSeconds--;
        setTimeout(startWeatherTimer, 1000);
    } else {
        // Время вышло, показываем погоду
        showWeather();
    }
}

// Функция показа музыкального плеера
function showMusicPlayer() {
    // Показываем контейнер с анимацией
    musicPlayerContainer.classList.add("show");

    // HTML музыкального плеера (без желтой кнопки)
    const musicPlayerHTML = `
        <div class="music-player" id="musicPlayer">
            <div class="player-container">
                <!-- Вращающийся диск -->
                <div class="disc-container">
                    <svg class="disc" viewBox="0 0 128 128">
                        <rect width="128" height="128" fill="black"></rect>
                        <circle cx="20" cy="20" r="2" fill="white"></circle>
                        <circle cx="40" cy="30" r="2" fill="white"></circle>
                        <circle cx="60" cy="10" r="2" fill="white"></circle>
                        <circle cx="80" cy="40" r="2" fill="white"></circle>
                        <circle cx="100" cy="20" r="2" fill="white"></circle>
                        <circle cx="120" cy="50" r="2" fill="white"></circle>
                        <circle cx="90" cy="30" r="10" fill="white" fill-opacity="0.5"></circle>
                        <circle cx="90" cy="30" r="8" fill="white"></circle>
                        <path d="M0 128 Q32 64 64 128 T128 128" fill="purple" stroke="black" stroke-width="1"></path>
                        <path d="M0 128 Q32 48 64 128 T128 128" fill="mediumpurple" stroke="black" stroke-width="1"></path>
                        <path d="M0 128 Q32 32 64 128 T128 128" fill="rebeccapurple" stroke="black" stroke-width="1"></path>
                        <path d="M0 128 Q16 64 32 128 T64 128" fill="purple" stroke="black" stroke-width="1"></path>
                        <path d="M64 128 Q80 64 96 128 T128 128" fill="mediumpurple" stroke="black" stroke-width="1"></path>
                    </svg>
                    <div class="disc-inner"></div>
                </div>

                <!-- Карточка плеера -->
                <div class="player-card">
                    <!-- Верхняя часть с мини-диском -->
                    <div class="card-top">
                        <div class="small-disc-wrapper">
                            <svg class="small-disc" viewBox="0 0 128 128">
                                <rect width="128" height="128" fill="black"></rect>
                                <circle cx="20" cy="20" r="2" fill="white"></circle>
                                <circle cx="40" cy="30" r="2" fill="white"></circle>
                                <circle cx="60" cy="10" r="2" fill="white"></circle>
                                <circle cx="80" cy="40" r="2" fill="white"></circle>
                                <circle cx="100" cy="20" r="2" fill="white"></circle>
                                <circle cx="120" cy="50" r="2" fill="white"></circle>
                                <circle cx="90" cy="30" r="10" fill="white" fill-opacity="0.5"></circle>
                                <circle cx="90" cy="30" r="8" fill="white"></circle>
                                <path d="M0 128 Q32 64 64 128 T128 128" fill="purple" stroke="black" stroke-width="1"></path>
                                <path d="M0 128 Q32 48 64 128 T128 128" fill="mediumpurple" stroke="black" stroke-width="1"></path>
                                <path d="M0 128 Q32 32 64 128 T128 128" fill="rebeccapurple" stroke="black" stroke-width="1"></path>
                                <path d="M0 128 Q16 64 32 128 T64 128" fill="purple" stroke="black" stroke-width="1"></path>
                                <path d="M64 128 Q80 64 96 128 T128 128" fill="mediumpurple" stroke="black" stroke-width="1"></path>
                            </svg>
                            <div class="small-disc-inner"></div>
                        </div>
                        <div class="track-info">
                            <p class="track-name" id="trackName">Luna Spa Theme</p>
                            <p class="track-artist" id="trackArtist">Relax & Harmony</p>
                        </div>
                    </div>

                    <!-- Прогресс бар -->
                    <div class="progress-container">
                        <span class="time-start" id="timeStart">0:00</span>
                        <input type="range" min="0" max="100" value="0" class="progress-bar" id="progressBar" />
                        <span class="time-end" id="timeEnd">0:00</span>
                    </div>

                    <!-- Элементы управления -->
                    <div class="controls">
                        <!-- Режим воспроизведения -->
                        <label class="control-btn play-mode" for="playMode">
                            <input type="checkbox" id="playMode" />
                            <svg class="svg-icon icon-gray repeat-icon" width="20" height="20" viewBox="0 0 24 24">
                                <polyline points="17 1 21 5 17 9"></polyline>
                                <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                                <polyline points="7 23 3 19 7 15"></polyline>
                                <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                            </svg>
                            <svg class="svg-icon icon-gray shuffle-icon" width="20" height="20" viewBox="0 0 24 24">
                                <polyline points="16 3 21 3 21 8"></polyline>
                                <line x1="4" y1="20" x2="21" y2="3"></line>
                                <polyline points="21 16 21 21 16 21"></polyline>
                                <line x1="15" y1="15" x2="21" y2="21"></line>
                                <line x1="4" y1="4" x2="9" y2="9"></line>
                            </svg>
                        </label>

                        <!-- Назад -->
                        <div class="control-btn prev-btn" id="prevBtn">
                            <svg class="svg-icon" width="24" height="24" viewBox="0 0 24 24">
                                <polygon points="19 20 9 12 19 4 19 20"></polygon>
                                <line x1="5" y1="19" x2="5" y2="5"></line>
                            </svg>
                        </div>

                        <!-- Воспроизведение/Пауза -->
                        <label class="control-btn play-status" for="playStatus">
                            <input type="checkbox" id="playStatus" />
                            <svg class="svg-icon play-icon" width="24" height="24" viewBox="0 0 24 24">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                            <svg class="svg-icon pause-icon" width="24" height="24" viewBox="0 0 24 24">
                                <rect x="6" y="4" width="4" height="16"></rect>
                                <rect x="14" y="4" width="4" height="16"></rect>
                            </svg>
                        </label>

                        <!-- Вперед -->
                        <div class="control-btn next-btn" id="nextBtn">
                            <svg class="svg-icon" width="24" height="24" viewBox="0 0 24 24">
                                <polygon points="5 4 15 12 5 20 5 4"></polygon>
                                <line x1="19" y1="5" x2="19" y2="19"></line>
                            </svg>
                        </div>

                        <!-- Список -->
                        <div class="control-btn list-btn" id="listBtn">
                            <svg class="svg-icon icon-gray" width="20" height="20" viewBox="0 0 24 24">
                                <line x1="8" y1="6" x2="21" y2="6"></line>
                                <line x1="8" y1="12" x2="21" y2="12"></line>
                                <line x1="8" y1="18" x2="21" y2="18"></line>
                                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                <line x1="3" y1="18" x2="3.01" y2="18"></line>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Вставляем плеер в контейнер
    musicPlayerContainer.innerHTML = musicPlayerHTML;

    // Инициализируем аудиоплеер
    initializeAudioPlayer();
}

// Инициализация аудиоплеера
function initializeAudioPlayer() {
    // Создаем аудио элемент
    audioPlayer = new Audio();
    currentTrackIndex = 0;
    isPlaying = false;
    isShuffle = false;
    isRepeat = false;
    updateInterval = null;
    userInteracted = true; // Уже взаимодействовали - плеер виден

    // Обновляем информацию о треке
    function updateTrackInfo() {
        const track = musicTracks[currentTrackIndex];
        document.getElementById("trackName").textContent = track.title;
        document.getElementById("trackArtist").textContent = track.artist;
        document.getElementById("timeEnd").textContent = track.duration;

        // Обновляем источник аудио
        audioPlayer.src = track.src;

        // Сбрасываем прогресс
        document.getElementById("progressBar").value = 0;
        document.getElementById("timeStart").textContent = "0:00";
    }

    // Форматирование времени
    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }

    // Обновление прогресса
    function updateProgress() {
        if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
            const progress =
                (audioPlayer.currentTime / audioPlayer.duration) * 100;
            document.getElementById("progressBar").value = progress;
            document.getElementById("timeStart").textContent = formatTime(
                audioPlayer.currentTime,
            );
        }
    }

    // Воспроизведение/пауза
    document
        .getElementById("playStatus")
        .addEventListener("change", function () {
            if (this.checked) {
                // Пауза
                audioPlayer.pause();
                isPlaying = false;
                document.querySelector(".disc").classList.remove("playing");
                document
                    .querySelector(".small-disc")
                    .classList.remove("playing");
                clearInterval(updateInterval);
            } else {
                // Воспроизведение
                audioPlayer
                    .play()
                    .then(() => {
                        isPlaying = true;
                        document
                            .querySelector(".disc")
                            .classList.add("playing");
                        document
                            .querySelector(".small-disc")
                            .classList.add("playing");

                        // Запускаем обновление прогресса
                        clearInterval(updateInterval);
                        updateInterval = setInterval(updateProgress, 500);
                    })
                    .catch((error) => {
                        console.error("Error playing audio:", error);
                    });
            }
        });

    // Когда трек загружен
    audioPlayer.addEventListener("loadedmetadata", function () {
        document.getElementById("timeEnd").textContent = formatTime(
            audioPlayer.duration,
        );
    });

    // Прогресс бар
    document
        .getElementById("progressBar")
        .addEventListener("input", function () {
            if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
                const seekTime = (this.value / 100) * audioPlayer.duration;
                audioPlayer.currentTime = seekTime;
            }
        });

    // Кнопка "Назад"
    document.getElementById("prevBtn").addEventListener("click", function () {
        currentTrackIndex =
            (currentTrackIndex - 1 + musicTracks.length) % musicTracks.length;
        updateTrackInfo();
        if (isPlaying) {
            audioPlayer.play();
        }
    });

    // Кнопка "Вперед"
    document.getElementById("nextBtn").addEventListener("click", function () {
        if (isShuffle) {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * musicTracks.length);
            } while (newIndex === currentTrackIndex && musicTracks.length > 1);
            currentTrackIndex = newIndex;
        } else {
            currentTrackIndex = (currentTrackIndex + 1) % musicTracks.length;
        }
        updateTrackInfo();
        if (isPlaying) {
            audioPlayer.play();
        }
    });

    // Режим воспроизведения
    document.getElementById("playMode").addEventListener("change", function () {
        if (this.checked) {
            isShuffle = true;
            isRepeat = false;
        } else {
            isShuffle = false;
            isRepeat = true;
        }
    });

    // Когда трек заканчивается
    audioPlayer.addEventListener("ended", function () {
        if (isRepeat) {
            audioPlayer.currentTime = 0;
            audioPlayer.play();
        } else {
            document.getElementById("nextBtn").click();
        }
    });

    // Ошибка воспроизведения
    audioPlayer.addEventListener("error", function (e) {
        console.error("Audio error:", e);

        // Пробуем следующий трек
        setTimeout(() => {
            document.getElementById("nextBtn").click();
        }, 1000);
    });

    // Кнопка списка
    document.getElementById("listBtn").addEventListener("click", function () {
        showPlaylist();
    });

    // Инициализация первого трека
    updateTrackInfo();

    // Загружаем первый трек
    audioPlayer.load();
}

// Показать плейлист
function showPlaylist() {
    const playlistHTML = `
        <div class="playlist-overlay" id="playlistOverlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        ">
            <div class="playlist-container" style="
                background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.1) 100%);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                border: 1px solid rgba(255,255,255,0.2);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="color: white; margin: 0;">Плейлист</h3>
                    <button id="closePlaylist" style="
                        background: none;
                        border: none;
                        color: white;
                        font-size: 24px;
                        cursor: pointer;
                    ">×</button>
                </div>
                <div class="playlist-tracks" id="playlistTracks">
                    ${musicTracks
                        .map(
                            (track, index) => `
                        <div class="playlist-track" data-index="${index}" style="
                            display: flex;
                            align-items: center;
                            padding: 15px;
                            margin-bottom: 10px;
                            background: ${index === currentTrackIndex ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)"};
                            border-radius: 10px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            border: 1px solid ${index === currentTrackIndex ? "rgba(255,255,255,0.3)" : "transparent"};
                        ">
                            <div style="margin-right: 15px; color: rgba(255,255,255,0.7);">${index + 1}</div>
                            <div style="flex-grow: 1;">
                                <div style="color: white; font-weight: bold;">${track.title}</div>
                                <div style="color: rgba(255,255,255,0.7); font-size: 14px;">${track.artist}</div>
                            </div>
                            <div style="color: rgba(255,255,255,0.7);">${track.duration}</div>
                            ${index === currentTrackIndex ? '<div style="margin-left: 10px; color: #ffed4e;">▶</div>' : ""}
                        </div>
                    `,
                        )
                        .join("")}
                </div>
            </div>
        </div>
    `;

    // Вставляем плейлист
    const overlay = document.createElement("div");
    overlay.innerHTML = playlistHTML;
    document.body.appendChild(overlay);

    // Закрытие плейлиста
    document.getElementById("closePlaylist").addEventListener("click", function () {
        overlay.remove();
    });

    // Клик по треку
    document.querySelectorAll(".playlist-track").forEach((track) => {
        track.addEventListener("click", function () {
            const trackIndex = parseInt(this.getAttribute("data-index"));
            currentTrackIndex = trackIndex;

            // Обновляем плеер
            if (audioPlayer) {
                const track = musicTracks[currentTrackIndex];
                document.getElementById("trackName").textContent = track.title;
                document.getElementById("trackArtist").textContent =
                    track.artist;
                audioPlayer.src = track.src;

                if (isPlaying) {
                    audioPlayer.play();
                }
            }

            overlay.remove();
        });
    });

    // Закрытие по клику вне плейлиста
    document
        .getElementById("playlistOverlay")
        .addEventListener("click", function (e) {
            if (e.target === this) {
                overlay.remove();
            }
        });
}

// Функция показа погоды
function showWeather() {
    // Показываем контейнер с анимацией
    weatherContainer.classList.add("show");

    // Показываем сообщение о загрузке
    weatherContainer.innerHTML = `
        <div class="weather-card">
            <div class="loading">Загрузка погоды...</div>
        </div>
    `;

    // Загружаем данные о погоде
    loadWeatherData();
}

// Функция загрузки данных о погоде
async function loadWeatherData() {
    try {
        const response = await fetch(`https://ru.wttr.in/penza?format=j1`);
        const data = await response.json();

        // Извлекаем данные
        const current = data.current_condition[0];
        const temp = current.temp_C;
        const description = current.lang_ru[0].value;
        const humidity = current.humidity;
        const windSpeed = (current.windspeedKmph / 3.6).toFixed(1);
        const pressure = current.pressure;
        const feelsLike = current.FeelsLikeC;

        // Определяем иконку
        const weatherIcon = getWeatherIcon(description);

        // Формируем HTML для погоды
        const weatherHTML = `
            <div class="weather-card">
                <div class="location">
                    <span>📍</span>
                    <span>Пенза</span>
                </div>

                <div class="weather-main">
                    <div class="temperature">
                        ${temp}<span class="unit">°C</span>
                    </div>
                    ${weatherIcon}
                </div>

                <div class="description">
                    ${description}
                </div>

                <div class="details">
                    <div class="detail-row">
                        <span class="detail-label">Ощущается как:</span>
                        <span class="detail-value">${feelsLike}°C</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Влажность:</span>
                        <span class="detail-value">${humidity}%</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Ветер:</span>
                        <span class="detail-value">${windSpeed} м/с</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Давление:</span>
                        <span class="detail-value">${pressure} мм</span>
                    </div>
                </div>

                <div class="source">
                    Данные: wttr.in
                </div>
            </div>
        `;

        // Вставляем погоду в контейнер
        weatherContainer.innerHTML = weatherHTML;
    } catch (error) {
        console.error("Ошибка загрузки погоды:", error);
        weatherContainer.innerHTML = `
            <div class="weather-card">
                <div class="error">
                    Не удалось загрузить погоду
                </div>
            </div>
        `;
    }
}

// Оригинальный код страницы 404
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

// Запуск всего при загрузке страницы
document.addEventListener("DOMContentLoaded", function () {
    createStars();
    createFloatingElements();

    const ufoSystem = new UFOSystem();
    ufoSystem.start();

    // Запускаем невидимые таймеры:
    // 1. Музыкальный плеер - через 3 минуты
    startMusicPlayerTimer();
    // 2. Погода - через 2 минуты
    startWeatherTimer();
});
