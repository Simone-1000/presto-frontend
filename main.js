const cardsWrapper = document.querySelector("#cards-wrapper");
const searchInput = document.querySelector("#search-input");
const categorySelect = document.querySelector("#category-select");
const typeSelect = document.querySelector("#type-select");
const priceInput = document.querySelector("#price-input");
const sortSelect = document.querySelector("#sort-select");
const resetButton = document.querySelector("#reset-button");
const resultsCount = document.querySelector("#results-count");
const feedback = document.querySelector("#feedback");

let annunci = [];

const euro = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR"
});

const categoryStyles = {
  Elettronica: { icon: "💻", color: "#e8ecff" },
  Motori: { icon: "🚗", color: "#ffe9dd" },
  Sport: { icon: "⚽", color: "#e7f4d9" },
  Immobili: { icon: "🏠", color: "#ffefd1" },
  Abbigliamento: { icon: "👕", color: "#f5e7fb" },
  Arredamento: { icon: "🛋️", color: "#e2f2f3" },
  Giardinaggio: { icon: "🌱", color: "#e4f4e8" },
  Musica: { icon: "🎸", color: "#ffe6ee" }
};

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  element.className = className;
  element.textContent = text;

  return element;
}

function showAnnunci(lista) {
  cardsWrapper.replaceChildren();

  const fragment = document.createDocumentFragment();

  lista.forEach((annuncio) => {
    const style = categoryStyles[annuncio.category] || {
      icon: "📦",
      color: "#edf0ff"
    };

    const card = document.createElement("article");
    card.className = "card";

    const visual = createElement("div", "card-visual", style.icon);
    visual.style.setProperty("--card-color", style.color);
    visual.setAttribute("aria-hidden", "true");

    const body = document.createElement("div");
    body.className = "card-body";

    const category = createElement(
      "p",
      "card-category",
      annuncio.category
    );

    const name = createElement("h3", "", annuncio.name);

    const price = createElement(
      "p",
      "card-price",
      euro.format(Number(annuncio.price))
    );

    const isSearch = annuncio.type === "search";

    const badge = createElement(
      "span",
      isSearch ? "badge badge-search" : "badge",
      isSearch ? "Cerco" : "In vendita"
    );

    body.append(category, name, price, badge);
    card.append(visual, body);
    fragment.append(card);
  });

  cardsWrapper.append(fragment);

  resultsCount.textContent =
    lista.length === 1
      ? "1 annuncio trovato"
      : `${lista.length} annunci trovati`;

  feedback.hidden = lista.length > 0;

  feedback.textContent =
    lista.length === 0
      ? "Nessun annuncio trovato. Prova a modificare o azzerare i filtri."
      : "";
}

function populateCategories() {
  const categories = [
    ...new Set(annunci.map((annuncio) => annuncio.category))
  ];

  categories.sort((a, b) => a.localeCompare(b, "it"));

  categories.forEach((category) => {
    const option = document.createElement("option");

    option.value = category;
    option.textContent = category;

    categorySelect.append(option);
  });
}

function filterAnnunci() {
  const search = searchInput.value.trim().toLocaleLowerCase("it");
  const category = categorySelect.value;
  const type = typeSelect.value;

  const maxPrice =
    priceInput.value === ""
      ? Infinity
      : Number(priceInput.value);

  const filtered = annunci.filter((annuncio) => {
    const matchesName = annuncio.name
      .toLocaleLowerCase("it")
      .includes(search);

    const matchesCategory =
      category === "all" || annuncio.category === category;

    const matchesType =
      type === "all" || annuncio.type === type;

    const matchesPrice =
      Number(annuncio.price) <= maxPrice;

    return (
      matchesName &&
      matchesCategory &&
      matchesType &&
      matchesPrice
    );
  });

  switch (sortSelect.value) {
    case "price-asc":
      filtered.sort((a, b) => Number(a.price) - Number(b.price));
      break;

    case "price-desc":
      filtered.sort((a, b) => Number(b.price) - Number(a.price));
      break;

    case "name":
      filtered.sort((a, b) => a.name.localeCompare(b.name, "it"));
      break;
  }

  showAnnunci(filtered);
}

searchInput.addEventListener("input", filterAnnunci);
priceInput.addEventListener("input", filterAnnunci);
categorySelect.addEventListener("change", filterAnnunci);
typeSelect.addEventListener("change", filterAnnunci);
sortSelect.addEventListener("change", filterAnnunci);

resetButton.addEventListener("click", () => {
  searchInput.value = "";
  categorySelect.value = "all";
  typeSelect.value = "all";
  priceInput.value = "";
  sortSelect.value = "default";

  filterAnnunci();
});

async function loadAnnunci() {
  try {
    const response = await fetch("./annunci.json");

    if (!response.ok) {
      throw new Error("Impossibile caricare gli annunci.");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Il file degli annunci deve contenere un array.");
    }

    annunci = data;

    populateCategories();
    filterAnnunci();
  } catch (error) {
    resultsCount.textContent = "Caricamento non riuscito";

    feedback.hidden = false;
    feedback.textContent =
      "Gli annunci non sono disponibili. Riprova più tardi.";

    console.error(error);
  }
}

loadAnnunci();