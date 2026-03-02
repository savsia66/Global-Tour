const themeToggleBtn = document.getElementById("theme-toggle-btn");

if (
  localStorage.getItem("theme") === "dark" ||
  (!("theme" in localStorage) &&
    window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

themeToggleBtn.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  if (document.documentElement.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});

const countriesGrid = document.getElementById("countries-grid");
const searchInput = document.getElementById("search");
const searchWrapper = document.getElementById("search-wrapper");
const filterBtn = document.getElementById("filter-btn");
const savedToggleBtn = document.getElementById("saved-toggle-btn");
const savedIcon = document.getElementById("saved-icon");
const filterDropdown = document.getElementById("filter-dropdown");
const loadingIndicator = document.getElementById("loading");
const modal = document.getElementById("country-modal");
const modalContent = document.getElementById("modal-content");
const closeModalBtn = document.getElementById("close-modal");

const modalFlag = document.getElementById("modal-flag");
const modalTitle = document.getElementById("modal-title");
const modalCapital = document.getElementById("modal-capital");
const modalSummary = document.getElementById("modal-summary");
const modalNeighbors = document.getElementById("modal-neighbors");

const weatherCard = document.getElementById("weather-card");
const weatherEffectLayer = document.getElementById("weather-effect-layer");
const modalWeatherTemp = document.getElementById("modal-weather-temp");
const modalTime = document.getElementById("modal-time");
const modalWeatherIcon = document.getElementById("modal-weather-icon");
const modalWeatherDesc = document.getElementById("modal-weather-desc");

let allCountries = [];
let savedCountries = JSON.parse(localStorage.getItem("savedCountries")) || [];
let showSavedOnly = false;
let map = null;
let mapMarker = null;

let selectedRegion = "all";
let selectedClimate = "all";
let selectedSort = "name-asc";

const customOptions = document.querySelectorAll(".custom-option");
customOptions.forEach((option) => {
  option.addEventListener("click", (e) => {
    const filterType = e.target.getAttribute("data-filter");
    const value = e.target.getAttribute("data-value");
    const text = e.target.innerText;

    if (filterType === "region") {
      selectedRegion = value;
      document.getElementById("region-display").innerText = text;
    } else if (filterType === "climate") {
      selectedClimate = value;
      document.getElementById("climate-display").innerText = text;
    } else if (filterType === "sort") {
      selectedSort = value;
      document.getElementById("sort-display").innerText = text;
    }
    applyFilters();
    const parentUl = e.target.closest("ul");
    parentUl.style.display = "none";
    setTimeout(() => {
      parentUl.style.display = "";
    }, 150);
  });
});

function applyWeatherEffects(weatherCode, windSpeed, isDay) {
  weatherCard.className =
    "weather-card p-6 md:p-8 rounded-[23px] shadow-lg text-white mb-8";

  const sunRaysHTML = `
    <div class="sun-core"></div>
    <div class="rays-container">
      ${Array.from({ length: 8 }, (_, i) => `<div class="ray" style="--i:${i + 1}"></div>`).join("")}
    </div>
  `;

  const simpleSunHTML = `<div class="sun-core-simple"></div>`;

  const bigMoonHTML = `
    <div style="position: absolute; height: 44%; width: 44%; top: 28%; left: 28%; border-radius: 50%; box-shadow: inset -12px -4px 0 0 #e2e8f0; filter: drop-shadow(0 0 15px rgba(255,255,255,0.3)); z-index: 2;"></div>
  `;

  const smallMoonHTML = `
    <div style="position: absolute; height: 50%; width: 50%; top: 15%; left: 15%; border-radius: 50%; box-shadow: inset -8px -3px 0 0 #e2e8f0; filter: drop-shadow(0 0 10px rgba(255,255,255,0.3)); z-index: 1;"></div>
  `;

  const animSunny = isDay
    ? `<div class="icon-sunny">${sunRaysHTML}</div>`
    : `<div style="width: 100%; height: 100%; position: relative;">${bigMoonHTML}</div>`;

  const animPartlyCloudy = `
    <div class="icon-partly-cloudy">
      <div class="pc-sun">${isDay ? simpleSunHTML : smallMoonHTML}</div>
      <div class="pc-cloud cloud-shape"></div>
    </div>`;

  const animCloudy = `
    <div class="icon-cloudy-container">
      <div class="icon-cloudy cloud-shape"></div>
    </div>`;
  const animRainy =
    '<div class="icon-rainy"><div class="rain-cloud cloud-shape"></div><div class="rain-drops"></div></div>';
  const animSnowy = `
    <div class="icon-snowy" style="position: relative; height: 100%; width: 100%;">
      <div class="snow-cloud cloud-shape" style="z-index: 2; position: relative;"></div>
      <div class="snow-drops" style="z-index: 1; position: absolute; inset: 0;">
        <div class="snow-particle p1"></div>
        <div class="snow-particle p2"></div>
        <div class="snow-particle p3"></div>
      </div>
    </div>`;
  const animThundery =
    '<div class="icon-thundery"><div class="thunder-cloud cloud-shape"></div><div class="thunder-drops"></div></div>';

  let isWindy = windSpeed > 20;

  if (weatherCode === 0) {
    weatherCard.classList.add(isDay ? "weather-sunny" : "weather-rainy");
    modalWeatherIcon.innerHTML = animSunny;
    modalWeatherDesc.textContent = isDay ? "Clear & Sunny" : "Clear Night";
  } else if (weatherCode > 0 && weatherCode < 3) {
    weatherCard.classList.add(isDay ? "weather-cloudy" : "weather-rainy");
    modalWeatherIcon.innerHTML = animPartlyCloudy;
    modalWeatherDesc.textContent = isDay
      ? "Partly Cloudy"
      : "Partly Cloudy Night";
  } else if (weatherCode === 3) {
    weatherCard.classList.add(isDay ? "weather-cloudy" : "weather-rainy");
    modalWeatherIcon.innerHTML = animCloudy;
    modalWeatherDesc.textContent = "Overcast";
  } else if (
    (weatherCode >= 51 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82)
  ) {
    weatherCard.classList.add("weather-rainy");
    modalWeatherIcon.innerHTML = animRainy;
    modalWeatherDesc.textContent = "Raining";
  } else if (weatherCode >= 71 && weatherCode <= 77) {
    weatherCard.classList.add("weather-snowy");
    modalWeatherIcon.innerHTML = animSnowy;
    modalWeatherDesc.textContent = "Snowing";
  } else if (weatherCode >= 95) {
    weatherCard.classList.add("weather-rainy");
    modalWeatherIcon.innerHTML = animThundery;
    modalWeatherDesc.textContent = "Thunderstorm";
  } else {
    weatherCard.classList.add(isDay ? "weather-cloudy" : "weather-rainy");
    modalWeatherIcon.innerHTML = animCloudy;
    modalWeatherDesc.textContent = "Unknown";
  }

  if (isWindy) {
    modalWeatherDesc.textContent += " & Windy";
  }
}

async function fetchCountries() {
  try {
    loadingIndicator.classList.remove("hidden");
    countriesGrid.innerHTML = "";

    const response = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,flags,population,region,capital,latlng,area,cca3,borders",
    );

    if (!response.ok) throw new Error("Failed to fetch API data");

    allCountries = await response.json();
    applyFilters();
  } catch (error) {
    console.error(error);
    countriesGrid.innerHTML =
      '<p class="text-red-500 col-span-full text-center py-4 font-semibold">Failed to load country data.</p>';
  } finally {
    loadingIndicator.classList.add("hidden");
  }
}

function toggleSaveCountry(code) {
  if (savedCountries.includes(code)) {
    savedCountries = savedCountries.filter((c) => c !== code);
  } else {
    savedCountries.push(code);
  }
  localStorage.setItem("savedCountries", JSON.stringify(savedCountries));

  if (showSavedOnly) {
    applyFilters();
  }
}

function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase();

  let filteredData = allCountries.filter((country) => {
    const matchesSearch = country.name.common
      .toLowerCase()
      .includes(searchTerm);
    const matchesRegion =
      selectedRegion === "all" || country.region === selectedRegion;
    const matchesSaved = showSavedOnly
      ? savedCountries.includes(country.cca3)
      : true;

    let matchesClimate = true;
    if (
      selectedClimate !== "all" &&
      country.latlng &&
      country.latlng.length > 0
    ) {
      const lat = country.latlng[0];
      if (selectedClimate === "tropical")
        matchesClimate = lat > -23.5 && lat < 23.5;
      else if (selectedClimate === "northern") matchesClimate = lat >= 23.5;
      else if (selectedClimate === "southern") matchesClimate = lat <= -23.5;
    }

    return matchesSearch && matchesRegion && matchesClimate && matchesSaved;
  });

  filteredData.sort((a, b) => {
    if (selectedSort === "name-asc")
      return a.name.common.localeCompare(b.name.common);
    if (selectedSort === "name-desc")
      return b.name.common.localeCompare(a.name.common);
    if (selectedSort === "pop-desc") return b.population - a.population;
    if (selectedSort === "pop-asc") return a.population - b.population;
    if (selectedSort === "area-desc") return (b.area || 0) - (a.area || 0);
    if (selectedSort === "area-asc") return (a.area || 0) - (b.area || 0);
    return 0;
  });

  renderCountries(filteredData);
}

function renderCountries(countriesToRender) {
  countriesGrid.innerHTML = "";

  if (countriesToRender.length === 0) {
    countriesGrid.innerHTML =
      '<p class="text-slate-500 dark:text-slate-400 col-span-full text-center py-4">No countries found.</p>';
    return;
  }

  countriesToRender.forEach((country) => {
    const name = country.name.common;
    const code = country.cca3;
    const flagUrl = country.flags.svg || country.flags.png;
    const capital =
      country.capital && country.capital.length > 0
        ? country.capital[0]
        : "N/A";
    const population = country.population.toLocaleString("en-US");
    const area = country.area
      ? country.area.toLocaleString("en-US") + " km²"
      : "N/A";

    const isSaved = savedCountries.includes(code);
    const heartFill = isSaved ? "currentColor" : "none";
    const heartColor = isSaved
      ? "text-red-500 border-transparent"
      : "text-white dark:text-slate-300 drop-shadow-md hover:text-red-400 dark:hover:text-red-400 border-white dark:border-slate-500";

    const article = document.createElement("div");
    article.className =
      "card-border-anim card-3d-wobble glass dark:shadow-none rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-cyan-500/20 transition-shadow duration-300 flex flex-col cursor-pointer relative border border-transparent";

    article.innerHTML = `
      <div class="card-border-wrapper rounded-2xl"></div>

      <button class="save-btn absolute top-3 right-3 p-2 bg-white/40 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-800 backdrop-blur-md rounded-full transition-colors z-40 ${heartColor} shadow-sm border">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="${heartFill}" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
      
      <div class="overflow-hidden rounded-t-2xl relative z-10">
        <img src="${flagUrl}" alt="Flag of ${name}" class="h-40 w-full object-cover border-b border-slate-100 dark:border-slate-700 transition-transform duration-700 hover:scale-110">
      </div>
      
      <div class="p-5 flex-1 flex flex-col relative z-10 bg-white/50 dark:bg-transparent rounded-b-2xl transition-colors">
        <h2 class="text-2xl font-bold text-slate-800 dark:text-white mb-4 transition-colors">${name}</h2>
        <div class="space-y-2 mt-auto text-sm text-slate-600 dark:text-slate-300 transition-colors">
          <p><span class="font-semibold text-slate-800 dark:text-slate-200">Capital:</span> ${capital}</p>
          <p><span class="font-semibold text-slate-800 dark:text-slate-200">Population:</span> ${population}</p>
          <p><span class="font-semibold text-slate-800 dark:text-slate-200">Area:</span> ${area}</p>
        </div>
      </div>
    `;

    const saveBtn = article.querySelector(".save-btn");
    saveBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const svgIcon = saveBtn.querySelector("svg");

      svgIcon.classList.add("heart-pop");

      setTimeout(() => {
        svgIcon.classList.remove("heart-pop");
      }, 400);

      const isNowSaved = !savedCountries.includes(code);
      const newHeartFill = isNowSaved ? "currentColor" : "none";
      const newHeartColor = isNowSaved
        ? "text-red-500 border-transparent"
        : "text-white dark:text-slate-300 drop-shadow-md hover:text-red-400 dark:hover:text-red-400 border-white dark:border-slate-500";

      svgIcon.setAttribute("fill", newHeartFill);

      saveBtn.className = `save-btn absolute top-3 right-3 p-2 bg-white/40 dark:bg-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-800 backdrop-blur-md rounded-full transition-colors z-40 shadow-sm border ${newHeartColor}`;

      toggleSaveCountry(code);
    });

    article.addEventListener("click", () => openModal(country));
    countriesGrid.appendChild(article);
  });
}

async function openModal(country) {
  modal.classList.remove("hidden");
  modalContent.scrollTop = 0;

  const name = country.name.common;
  const capital =
    country.capital && country.capital.length > 0 ? country.capital[0] : "N/A";
  const lat =
    country.latlng && country.latlng.length > 0 ? country.latlng[0] : 0;
  const lng =
    country.latlng && country.latlng.length > 1 ? country.latlng[1] : 0;

  modalTitle.textContent = name;
  modalCapital.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>${capital}`;
  modalFlag.src = country.flags.svg || country.flags.png;

  modalSummary.textContent = "Loading live data...";
  modalWeatherTemp.textContent = "--°C";
  modalTime.textContent = "--:--";
  weatherCard.className =
    "weather-card p-6 md:p-8 rounded-[23px] shadow-lg text-white mb-8";
  weatherEffectLayer.className = "effect-layer rounded-[23px]";
  modalWeatherIcon.innerHTML = "";
  modalWeatherDesc.textContent = "Fetching Atmosphere...";

  if (!map) {
    map = L.map("map").setView([lat, lng], 5);
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
      },
    ).addTo(map);
    mapMarker = L.marker([lat, lng]).addTo(map);
  } else {
    map.setView([lat, lng], 5);
    mapMarker.setLatLng([lat, lng]);
  }

  setTimeout(() => {
    map.invalidateSize();
  }, 100);

  modalNeighbors.innerHTML = "";
  if (country.borders && country.borders.length > 0) {
    country.borders.forEach((borderCode) => {
      const neighbor = allCountries.find((c) => c.cca3 === borderCode);
      if (neighbor) {
        const nName = neighbor.name.common;
        const nFlag = neighbor.flags.svg || neighbor.flags.png;
        const neighborDiv = document.createElement("div");
        neighborDiv.className =
          "shrink-0 w-24 flex flex-col items-center cursor-pointer group";
        neighborDiv.innerHTML = `
          <div class="relative overflow-hidden rounded-lg mb-2 border border-slate-200 dark:border-slate-700 transition-all duration-300 group-hover:shadow-md group-hover:shadow-blue-500/20 dark:group-hover:shadow-cyan-500/20 group-hover:border-blue-400 dark:group-hover:border-cyan-400 w-24 h-16">
            <img src="${nFlag}" alt="${nName}" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110">
          </div>
          <span class="text-xs text-center font-semibold text-slate-600 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-cyan-400 transition-colors duration-300 line-clamp-2">${nName}</span>
        `;
        neighborDiv.addEventListener("click", () => openModal(neighbor));
        modalNeighbors.appendChild(neighborDiv);
      }
    });
  } else {
    modalNeighbors.innerHTML =
      '<p class="text-sm text-slate-400 dark:text-slate-500 italic">No land borders (Island nation).</p>';
  }

  const fetchWiki = fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,
  )
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null);

  const fetchWeather = fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&timezone=auto`,
  )
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null);

  const [wiki, weather] = await Promise.all([fetchWiki, fetchWeather]);

  if (wiki) {
    modalSummary.textContent = wiki.extract || "No summary available.";
  } else {
    modalSummary.textContent = "Wikipedia summary currently unavailable.";
  }

  if (weather && weather.current_weather) {
    modalWeatherTemp.textContent = `${weather.current_weather.temperature}°C`;

    let isDay = true;
    if (weather.current_weather.is_day !== undefined) {
      isDay = weather.current_weather.is_day === 1;
    } else if (weather.timezone) {
      const localTime = new Date(
        new Date().toLocaleString("en-US", { timeZone: weather.timezone }),
      );
      const hour = localTime.getHours();
      isDay = hour >= 6 && hour < 19;
    }

    if (weather.timezone) {
      const timeString = new Date().toLocaleTimeString("en-US", {
        timeZone: weather.timezone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      modalTime.textContent = timeString;
    }

    applyWeatherEffects(
      weather.current_weather.weathercode,
      weather.current_weather.windspeed,
      isDay,
    );
  } else {
    modalWeatherTemp.textContent = "N/A";
    modalTime.textContent = "Time unavailable";
    modalWeatherDesc.textContent = "Data Offline";
  }
}

searchInput.addEventListener("input", applyFilters);

let filterHoverTimeout;

const showFilterDropdown = () => {
  clearTimeout(filterHoverTimeout);
  filterDropdown.classList.remove("hidden");
  searchWrapper.classList.add("rounded-b-none", "!border-b-transparent");
};

const hideFilterDropdown = () => {
  filterHoverTimeout = setTimeout(() => {
    filterDropdown.classList.add("hidden");
    searchWrapper.classList.remove("rounded-b-none", "!border-b-transparent");
  }, 150);
};

filterBtn.addEventListener("mouseenter", showFilterDropdown);
filterDropdown.addEventListener("mouseenter", showFilterDropdown);

savedToggleBtn.addEventListener("click", () => {
  savedIcon.classList.add("heart-pop");

  setTimeout(() => {
    savedIcon.classList.remove("heart-pop");
  }, 400);

  showSavedOnly = !showSavedOnly;
  if (showSavedOnly) {
    savedToggleBtn.classList.remove("text-slate-400", "dark:text-slate-500");
    savedToggleBtn.classList.add(
      "text-red-500",
      "bg-red-50",
      "border-red-200",
      "dark:bg-red-900/30",
      "dark:border-red-800",
      "dark:text-red-400",
    );
    savedIcon.setAttribute("fill", "currentColor");
  } else {
    savedToggleBtn.classList.add("text-slate-400", "dark:text-slate-500");
    savedToggleBtn.classList.remove(
      "text-red-500",
      "bg-red-50",
      "border-red-200",
      "dark:bg-red-900/30",
      "dark:border-red-800",
      "dark:text-red-400",
    );
    savedIcon.setAttribute("fill", "none");
  }
  applyFilters();
});

document.addEventListener("click", (e) => {
  if (!filterBtn.contains(e.target) && !filterDropdown.contains(e.target)) {
    filterDropdown.classList.add("hidden");
    searchWrapper.classList.remove("rounded-b-none", "!border-b-transparent");
  }
});

closeModalBtn.addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});
const clearFiltersBtn = document.getElementById("clear-filters-btn");

clearFiltersBtn.addEventListener("click", () => {
  selectedRegion = "all";
  selectedClimate = "all";
  selectedSort = "name-asc";
  searchInput.value = "";

  document.getElementById("region-display").innerText = "All Regions";
  document.getElementById("climate-display").innerText = "Any Climate";
  document.getElementById("sort-display").innerText = "Alphabetical (A-Z)";

  applyFilters();
});
fetchCountries();
