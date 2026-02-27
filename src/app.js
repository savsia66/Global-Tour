const countriesGrid = document.getElementById("countries-grid");
const searchInput = document.getElementById("search");
const loadingIndicator = document.getElementById("loading");
const modal = document.getElementById("country-modal");
const closeModalBtn = document.getElementById("close-modal");

const modalFlag = document.getElementById("modal-flag");
const modalTitle = document.getElementById("modal-title");
const modalCapital = document.getElementById("modal-capital");
const modalSummary = document.getElementById("modal-summary");

const weatherCard = document.getElementById("weather-card");
const weatherEffectLayer = document.getElementById("weather-effect-layer");
const modalWeatherTemp = document.getElementById("modal-weather-temp");
const modalTime = document.getElementById("modal-time");
const modalWeatherIcon = document.getElementById("modal-weather-icon");
const modalWeatherDesc = document.getElementById("modal-weather-desc");

let allCountries = [];

function applyWeatherEffects(weatherCode, windSpeed) {
  weatherCard.className =
    "weather-card p-6 md:p-8 rounded-[23px] shadow-lg text-white";

  const animSunny = '<div class="icon-sunny"></div>';
  const animPartlyCloudy =
    '<div class="icon-partly-cloudy"><div class="pc-sun"></div><div class="pc-cloud cloud-shape"></div></div>';
  const animCloudy = '<div class="icon-cloudy cloud-shape"></div>';
  const animRainy =
    '<div class="icon-rainy"><div class="rain-cloud cloud-shape"></div><div class="rain-drops"></div></div>';
  const animSnowy =
    '<div class="icon-rainy"><div class="snow-cloud cloud-shape"></div><div class="snow-drops"></div></div>';
  const animThundery =
    '<div class="icon-thundery"><div class="thunder-cloud cloud-shape"></div><div class="thunder-drops"></div></div>';

  let isWindy = windSpeed > 20;

  if (weatherCode === 0) {
    weatherCard.classList.add("weather-sunny");
    modalWeatherIcon.innerHTML = animSunny;
    modalWeatherDesc.textContent = "Clear & Sunny";
  } else if (weatherCode > 0 && weatherCode < 3) {
    weatherCard.classList.add("weather-cloudy");
    modalWeatherIcon.innerHTML = animPartlyCloudy;
    modalWeatherDesc.textContent = "Partly Cloudy";
  } else if (weatherCode === 3) {
    weatherCard.classList.add("weather-cloudy");
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
    weatherCard.classList.add("weather-cloudy");
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
      "https://restcountries.com/v3.1/all?fields=name,flags,population,region,capital,latlng",
    );

    if (!response.ok) throw new Error("Failed to fetch API data");

    const data = await response.json();
    allCountries = data.sort((a, b) =>
      a.name.common.localeCompare(b.name.common),
    );
    renderCountries(allCountries);
  } catch (error) {
    console.error(error);
    countriesGrid.innerHTML =
      '<p class="text-red-500 col-span-full text-center py-4 font-semibold">Failed to load country data.</p>';
  } finally {
    loadingIndicator.classList.add("hidden");
  }
}

function renderCountries(countriesToRender) {
  countriesGrid.innerHTML = "";

  if (countriesToRender.length === 0) {
    countriesGrid.innerHTML =
      '<p class="text-slate-500 col-span-full text-center py-4">No countries found.</p>';
    return;
  }

  countriesToRender.forEach((country) => {
    const name = country.name.common;
    const flagUrl = country.flags.svg || country.flags.png;
    const population = country.population.toLocaleString("en-US");
    const region = country.region;
    const capital =
      country.capital && country.capital.length > 0
        ? country.capital[0]
        : "N/A";

    const article = document.createElement("div");
    article.className =
      "glass rounded-2xl shadow-sm hover:-translate-y-1 transition-transform duration-200 overflow-hidden flex flex-col cursor-pointer";

    article.innerHTML = `
      <img src="${flagUrl}" alt="Flag of ${name}" class="h-40 w-full object-cover border-b border-slate-100">
      <div class="p-5 flex-1 flex flex-col">
        <h2 class="text-2xl font-bold text-slate-800 mb-4">${name}</h2>
        <div class="space-y-2 mt-auto text-sm text-slate-600">
          <p><span class="font-semibold text-slate-800">Population:</span> ${population}</p>
          <p><span class="font-semibold text-slate-800">Region:</span> ${region}</p>
          <p><span class="font-semibold text-slate-800">Capital:</span> ${capital}</p>
        </div>
      </div>
    `;

    article.addEventListener("click", () => openModal(country));
    countriesGrid.appendChild(article);
  });
}

async function openModal(country) {
  modal.classList.remove("hidden");

  const name = country.name.common;
  const capital =
    country.capital && country.capital.length > 0 ? country.capital[0] : "N/A";
  const lat = country.latlng[0];
  const lng = country.latlng[1];

  modalTitle.textContent = name;
  modalCapital.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>${capital}`;
  modalFlag.src = country.flags.svg || country.flags.png;

  modalSummary.textContent = "Loading live data...";
  modalWeatherTemp.textContent = "--°C";
  modalTime.textContent = "--:--";
  weatherCard.className =
    "weather-card p-6 md:p-8 rounded-[23px] shadow-lg text-white bg-slate-300";
  weatherEffectLayer.className = "effect-layer rounded-[23px]";
  modalWeatherIcon.textContent = "⏳";
  modalWeatherDesc.textContent = "Fetching Atmosphere...";

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

    applyWeatherEffects(
      weather.current_weather.weathercode,
      weather.current_weather.windspeed,
    );

    if (weather.timezone) {
      const timeString = new Date().toLocaleTimeString("en-US", {
        timeZone: weather.timezone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      modalTime.textContent = timeString;
    }
  } else {
    modalWeatherTemp.textContent = "N/A";
    modalTime.textContent = "Time unavailable";
    modalWeatherDesc.textContent = "Data Offline";
  }
}

function applySearchFilter() {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredData = allCountries.filter((country) =>
    country.name.common.toLowerCase().includes(searchTerm),
  );
  renderCountries(filteredData);
}

searchInput.addEventListener("input", applySearchFilter);

closeModalBtn.addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});

fetchCountries();
