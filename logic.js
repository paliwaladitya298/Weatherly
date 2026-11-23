(function () {
const API_KEY = "20dbb3cd52e21f32d3c74677e1a542c3";
const cityInput = document.getElementById("city");
const searchButton = document.querySelector(".search-button");
const countrySelect = document.getElementById("country");
const currentWeatherTitle = document.getElementById("current-weather-title");
const region = document.getElementById("region");
const temperatureValue = document.getElementById("temp-value");
const temperatureDisplay = document.querySelector(".temperature");
const condition = document.getElementById("condition");
const feelsLike = document.getElementById("feels-like");
const highLow = document.getElementById("high-low");
const weatherIcon = document.getElementById("weather-icon");
const outlook = document.getElementById("outlook");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");
const sunrise = document.getElementById("sunrise");
const sunset = document.querySelector(".sunset .sun-copy strong");
const daylight = document.getElementById("daylight");
const weatherVideos = Array.from(document.querySelectorAll(".weather-video"));
const WEATHER_VIDEO_PATHS = {
    rain: "assets/rain.mp4",
    clear: "assets/sunny.mp4",
    storm: "assets/thunderstorm.mp4",
    clouds: "assets/cloudy.mp4",
    snow: "assets/snowfall.mp4",
    drizzle: "assets/drizzle.mp4",
    fog: "assets/fog.mp4",
    haze: "assets/haze.mp4",
    mist: "assets/mist.mp4"
};
const desktopDate = document.getElementById("desktop-date");
const mobileDate = document.getElementById("mobile-date");
const updatedTime = document.getElementById("updated-time");
const mobileUpdate = document.getElementById("mobile-update");
const navDate = document.querySelector(".nav-date");

let cityTimezoneOffset = 0;
let currentCity = "Indore";
let requestNumber = 0;

function getCountryName(countryCode) {
    const option = Array.from(countrySelect.options).find(
        (countryOption) => countryOption.value === countryCode
    );

    return option ? option.textContent : countryCode;
}

function formatCityTime(timestamp, options) {
    const localDate = new Date((timestamp + cityTimezoneOffset) * 1000);

    return new Intl.DateTimeFormat("en-US", {
        ...options,
        timeZone: "UTC"
    }).format(localDate);
}

function formatOffset(offsetSeconds) {
    const sign = offsetSeconds >= 0 ? "+" : "-";
    const absoluteOffset = Math.abs(offsetSeconds);
    const hours = String(Math.floor(absoluteOffset / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((absoluteOffset % 3600) / 60)).padStart(2, "0");

    return `UTC${sign}${hours}:${minutes}`;
}

function updateCityClock() {
    if (!desktopDate || !mobileDate || !updatedTime || !mobileUpdate) {
        return;
    }

    const nowInSeconds = Date.now() / 1000;
    const dateText = formatCityTime(nowInSeconds, {
        weekday: "short",
        month: "short",
        day: "numeric"
    }).toUpperCase();
    const timeText = formatCityTime(nowInSeconds, {
        hour: "numeric",
        minute: "2-digit"
    });
    const dayName = formatCityTime(nowInSeconds, {
        weekday: "long"
    }).toUpperCase();
    const offsetText = formatOffset(cityTimezoneOffset);
    const dateTimeText = `${dateText} · ${timeText}`;

    desktopDate.textContent = dateText;
    mobileDate.textContent = `${dateTimeText} ${offsetText}`;
    updatedTime.textContent = `${dateTimeText} ${offsetText}`;
    mobileUpdate.textContent = `${dayName} · ${timeText} ${offsetText}`;

    const currentInstant = new Date().toISOString();
    navDate.dateTime = currentInstant;
    updatedTime.dateTime = currentInstant;
}

function showSearchMessage(message) {
    outlook.textContent = message;
    outlook.setAttribute("aria-live", "polite");
}

function formatSunTime(timestamp) {
    return formatCityTime(timestamp, {
        hour: "numeric",
        minute: "2-digit"
    });
}

function updateWeather(weather) {
    const weatherCondition = weather.weather[0];
    const cityName = weather.name;
    const countryName = getCountryName(weather.sys.country);

    updateWeatherBackdrop(weatherCondition.id, weatherCondition.icon);
    currentCity = cityName;
    cityTimezoneOffset = weather.timezone;
    currentWeatherTitle.textContent = cityName;
    region.textContent = countryName;

    temperatureValue.textContent = `${Math.round(weather.main.temp)}°`;
    temperatureDisplay.setAttribute(
        "aria-label",
        `${Math.round(weather.main.temp)} degrees Celsius`
    );
    condition.textContent = weatherCondition.main;
    feelsLike.textContent = `Feels like ${Math.round(weather.main.feels_like)}°C`;
    highLow.textContent = `H ${Math.round(weather.main.temp_max)}° · L ${Math.round(weather.main.temp_min)}°`;

    outlook.textContent = weatherCondition.description;
    outlook.removeAttribute("aria-live");
    weatherIcon.style.backgroundImage = `url("https://openweathermap.org/img/wn/${weatherCondition.icon}@2x.png")`;
    weatherIcon.style.backgroundPosition = "center";
    weatherIcon.style.backgroundRepeat = "no-repeat";
    weatherIcon.style.backgroundSize = "contain";
    weatherIcon.style.stroke = "transparent";
    weatherIcon.setAttribute("aria-label", weatherCondition.description);

    humidity.textContent = `${weather.main.humidity}%`;
    wind.textContent = `${weather.wind.speed} m/s`;
    pressure.textContent = `${weather.main.pressure} hPa`;
    visibility.textContent = `${(weather.visibility / 1000).toFixed(1)} km`;

    sunrise.textContent = formatSunTime(weather.sys.sunrise);
    sunset.textContent = formatSunTime(weather.sys.sunset);
    const daylightSeconds = Math.max(0, weather.sys.sunset - weather.sys.sunrise);
    const daylightHours = Math.floor(daylightSeconds / 3600);
    const daylightMinutes = Math.floor((daylightSeconds % 3600) / 60);
    daylight.textContent = `${daylightHours}h ${daylightMinutes}m of daylight`;

    if (countrySelect.querySelector(`option[value="${weather.sys.country}"]`)) {
        countrySelect.value = weather.sys.country;
    }

    updateCityClock();
}

function updateWeatherBackdrop(conditionId, iconCode) {
    const weatherClasses = [
        "weather--clear",
        "weather--clouds",
        "weather--fog",
        "weather--haze",
        "weather--mist",
        "weather--drizzle",
        "weather--rain",
        "weather--storm",
        "weather--snow"
    ];
    const conditionCode = Number(conditionId);
    let weatherClass = "weather--clouds";

    if (conditionCode >= 200 && conditionCode < 300) {
        weatherClass = "weather--storm";
    } else if (conditionCode >= 300 && conditionCode < 400) {
        weatherClass = "weather--drizzle";
    } else if (conditionCode >= 500 && conditionCode < 600) {
        weatherClass = "weather--rain";
    } else if (conditionCode >= 600 && conditionCode < 700) {
        weatherClass = "weather--snow";
    } else if (conditionCode === 721) {
        weatherClass = "weather--haze";
    } else if (conditionCode === 701) {
        weatherClass = "weather--mist";
    } else if (conditionCode >= 700 && conditionCode < 800) {
        weatherClass = "weather--fog";
    } else if (conditionCode === 800) {
        weatherClass = "weather--clear";
    }

    document.body.classList.remove(...weatherClasses);
    document.body.classList.add(weatherClass);
    const activeVideoName = weatherClass.replace("weather--", "");
    const activeVideoClass = `weather-video--${activeVideoName}`;
    const activeVideoPath = WEATHER_VIDEO_PATHS[activeVideoName];
    const activeVideo = weatherVideos.find((video) => video.classList.contains(activeVideoClass));

    if (!activeVideoPath || !activeVideo) {
        throw new Error(`No video is configured for ${weatherClass}.`);
    }

    weatherVideos.forEach((video) => {
        if (video === activeVideo) {
            if (video.getAttribute("src") !== activeVideoPath) {
                video.src = activeVideoPath;
            }

            const playRequest = video.play();

            if (playRequest) {
                playRequest.catch((error) => {
                    console.error(`Unable to play the ${activeVideoClass} background video.`, error);
                });
            }
        } else {
            video.pause();
        }
    });

    document.body.dataset.time = iconCode.endsWith("n") ? "night" : "day";
}

async function fetchJson(url) {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "The weather service could not complete the request.");
    }

    return data;
}

async function searchWeather(city, countryCode) {
    const requestId = ++requestNumber;
    const query = countryCode ? `${city},${countryCode}` : city;

    showSearchMessage("Searching for current weather...");
    searchButton.disabled = true;

    try {
        const locations = await fetchJson(
            `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${API_KEY}`
        );

        if (requestId !== requestNumber) {
            return;
        }

        if (!Array.isArray(locations) || locations.length === 0) {
            throw new Error("City not found. Check the spelling and try again.");
        }

        const location = locations[0];
        const weather = await fetchJson(
            `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(location.lat)}&lon=${encodeURIComponent(location.lon)}&units=metric&appid=${API_KEY}`
        );

        if (requestId !== requestNumber) {
            return;
        }

        if (
            !weather.main ||
            !weather.weather ||
            weather.weather.length === 0 ||
            !weather.sys ||
            Number(weather.cod) !== 200 ||
            typeof weather.timezone !== "number"
        ) {
            throw new Error("The weather service returned incomplete data. Please try again.");
        }

        updateWeather(weather);
    } catch (error) {
        if (requestId === requestNumber) {
            showSearchMessage(
                error instanceof TypeError
                    ? "Unable to connect to the weather service. Check your connection and try again."
                    : error.message
            );
        }
    } finally {
        if (requestId === requestNumber) {
            searchButton.disabled = false;
        }
    }
}

function submitCitySearch() {
    const city = cityInput.value.trim();

    if (!city) {
        showSearchMessage("Enter a city name to search for its weather.");
        cityInput.focus();
        return;
    }

    searchWeather(city, countrySelect.value);
}

searchButton.addEventListener("click", submitCitySearch);
cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        submitCitySearch();
    }
});
countrySelect.addEventListener("change", () => {
    const city = cityInput.value.trim() || currentCity;

    if (countrySelect.value) {
        searchWeather(city, countrySelect.value);
    }
});

setInterval(updateCityClock, 60 * 1000);
searchWeather(currentCity, "IN");
})();
