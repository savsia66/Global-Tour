const countriesGrid = document.getElementById("countries-grid");
const searchInput = document.getElementById("search");
const loadingIndicator = document.getElementById("loading");

let allCountries = [];

async function fetchCountries() {
  try {
    loadingIndicator.classList.remove("hidden");
    countriesGrid.innerHTML = "";

    const response = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,flags,population,region,capital",
    );

    if (!response.ok) throw new Error("Failed to fetch API data");

    const data = await response.json();

    allCountries = data.sort((a, b) =>
      a.name.common.localeCompare(b.name.common),
    );

    renderCountries(allCountries);
  } catch (error) {
    console.error("Error fetching data:", error);
    countriesGrid.innerHTML =
      '<p class="text-red-500 col-span-full text-center py-4 font-semibold">Failed to load country data. Please check your connection.</p>';
  } finally {
    loadingIndicator.classList.add("hidden");
  }
}

function renderCountries(countriesToRender) {
  countriesGrid.innerHTML = "";

  if (countriesToRender.length === 0) {
    countriesGrid.innerHTML =
      '<p class="text-slate-500 col-span-full text-center py-4">No countries found matching your search.</p>';
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

    const article = document.createElement("a");

    article.href = `https://en.wikipedia.org/wiki/${encodeURIComponent(name)}`;
    article.target = "_blank";
    article.rel = "noopener noreferrer";

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

    countriesGrid.appendChild(article);
  });
}

function applySearchFilter() {
  const searchTerm = searchInput.value.toLowerCase();

  const filteredData = allCountries.filter((country) =>
    country.name.common.toLowerCase().includes(searchTerm),
  );

  renderCountries(filteredData);
}

searchInput.addEventListener("input", applySearchFilter);

fetchCountries();
