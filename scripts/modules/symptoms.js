// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const SYMPTOMS_URL = new URL("../database/symptoms.json", import.meta.url);

// Filter options (order as defined in the spec)
const LOCATIONS = [
  "Corpo Todo",
  "Cabeça",
  "Pescoço",
  "Abdômen",
  "Garganta",
  "Tórax",
  "Urinário",
  "Membros",
  "Psiquiátrico",
  "Serviços"
];

// Manchester level (as written in symptoms.json) -> key used in patientRisk
const LEVEL_KEY = {
  Vermelho: "red",
  Laranja: "orange",
  Amarelo: "yellow",
  Verde: "green",
  Azul: "blue"
};

// ---------------------------------------------------------------------------
// Elements
// ---------------------------------------------------------------------------
const symptomsBlock = document.getElementById("symptoms-block");
const symptomList = document.getElementById("symptom-list");
const addButton = document.getElementById("symptom-add");

// The popup is built here and appended to <body> (not inside the block):
// the block has backdrop-filter and a fixed size, which would trap and clip a
// position: fixed popup placed inside it.
const popup = createPopup();
const popupSearch = popup.querySelector(".symptom-popup__search");
const popupFilters = popup.querySelector(".symptom-popup__filters");
const popupList = popup.querySelector(".symptom-popup__list");
const popupClose = popup.querySelector(".close-button");

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let allSymptoms = [];      // flattened list from symptoms.json
let loadError = false;
let selected = [];         // symptoms the patient has chosen
let activeLocation = "";   // "" = all locations

const symptomsReady = loadSymptoms();

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const normalize = (text) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

async function loadSymptoms() {
  try {
    const response = await fetch(SYMPTOMS_URL);
    if (!response.ok) throw new Error("HTTP " + response.status);
    allSymptoms = flattenSymptoms(await response.json());
  } catch (error) {
    console.error("Não foi possível carregar symptoms.json:", error);
    loadError = true;
  }
}

function flattenSymptoms(data) {
  const list = [];

  for (const [level, locations] of Object.entries(data)) {
    if (!LEVEL_KEY[level]) continue;

    for (const [location, symptoms] of Object.entries(locations)) {
      symptoms.forEach((text, index) => {
        list.push({
          id: level + "|" + location + "|" + index,
          level,
          location,
          text,
          search: normalize(text + " " + location)
        });
      });
    }
  }

  // Alphabetical order, so the urgency level is not hinted at by the position
  list.sort((a, b) => a.text.localeCompare(b.text, "pt-BR"));
  return list;
}

// ---------------------------------------------------------------------------
// Popup
// ---------------------------------------------------------------------------
function createPopup() {
  const filterButtons = [
    '<button type="button" class="symptom-popup__filter symptom-popup__filter_active" data-location="" aria-pressed="true">Todos</button>',
    ...LOCATIONS.map(
      (location) =>
        '<button type="button" class="symptom-popup__filter" data-location="' +
        location +
        '" aria-pressed="false">' +
        location +
        "</button>"
    )
  ].join("");

  const background = document.createElement("div");
  background.className = "symptom-popup__bg hidden";
  background.innerHTML =
    '<div class="symptom-popup" role="dialog" aria-modal="true" aria-labelledby="symptom-popup-title">' +
    '<button type="button" class="close-button" aria-label="Fechar">X</button>' +
    '<div class="symptom-popup__header">' +
    '<h1 id="symptom-popup-title" class="symptom-popup__title">Adicionar sintoma</h1>' +
    "</div>" +
    '<input type="search" class="symptom-popup__search" placeholder="Buscar sintoma..." aria-label="Buscar sintoma" autocomplete="off">' +
    '<div class="symptom-popup__filters">' +
    filterButtons +
    "</div>" +
    '<ul class="symptom-popup__list"></ul>' +
    "</div>";

  document.body.appendChild(background);
  return background;
}

function openPopup() {
  popupSearch.value = "";
  setActiveFilter("");
  popup.classList.remove("hidden");
  symptomsReady.then(renderPopupList);

  // Avoid opening the on-screen keyboard automatically on touch devices
  if (window.matchMedia("(hover: hover)").matches) popupSearch.focus();
}

function closePopup() {
  popup.classList.add("hidden");
  addButton.focus();
}

function setActiveFilter(location) {
  activeLocation = location;

  popupFilters.querySelectorAll(".symptom-popup__filter").forEach((button) => {
    const isActive = button.dataset.location === location;
    button.classList.toggle("symptom-popup__filter_active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function createPopupItem(symptom, isSelected) {
  const row = document.createElement("li");

  const button = document.createElement("button");
  button.type = "button";
  button.className = "symptom-popup__item";
  button.dataset.id = symptom.id;
  button.disabled = isSelected;

  const name = document.createElement("span");
  name.textContent = symptom.text;

  const tag = document.createElement("span");
  tag.className = "symptom-popup__item-location";
  tag.textContent = isSelected ? "Já adicionado" : symptom.location;

  button.append(name, tag);
  row.append(button);
  return row;
}

function renderPopupList() {
  if (loadError) {
    const message = document.createElement("li");
    message.className = "symptom-popup__message";
    message.textContent = "Não foi possível carregar a lista de sintomas.";
    popupList.replaceChildren(message);
    return;
  }

  const terms = normalize(popupSearch.value).split(/\s+/).filter(Boolean);
  const selectedIds = new Set(selected.map((symptom) => symptom.id));

  const items = allSymptoms
    .filter((symptom) => !activeLocation || symptom.location === activeLocation)
    .filter((symptom) => terms.every((term) => symptom.search.includes(term)))
    .map((symptom) => createPopupItem(symptom, selectedIds.has(symptom.id)));

  // With no items the <ul> is empty and CSS shows "Nenhum sintoma encontrado."
  popupList.replaceChildren(...items);
}

// ---------------------------------------------------------------------------
// Selected symptoms list (inside the block)
// ---------------------------------------------------------------------------
function renderSelected() {
  const items = selected.map((symptom) => {
    const item = document.createElement("li");
    item.className = "symptoms__item";
    item.dataset.id = symptom.id;

    const info = document.createElement("div");
    info.className = "symptoms__info";

    const name = document.createElement("span");
    name.className = "symptoms__name";
    name.textContent = symptom.text;

    const location = document.createElement("span");
    location.className = "symptoms__location";
    location.textContent = symptom.location;

    info.append(name, location);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "symptoms__remove";
    remove.setAttribute("aria-label", "Remover sintoma: " + symptom.text);

    item.append(info, remove);
    return item;
  });

  symptomList.replaceChildren(...items);
}

function addSymptom(id) {
  if (selected.some((symptom) => symptom.id === id)) return;

  const found = allSymptoms.find((symptom) => symptom.id === id);
  if (!found) return;

  selected.push({
    id: found.id,
    level: found.level,
    location: found.location,
    text: found.text
  });

  renderSelected();
  notifyChange();
}

function removeSymptom(id) {
  selected = selected.filter((symptom) => symptom.id !== id);

  renderSelected();
  notifyChange();
}

// ---------------------------------------------------------------------------
// Data for other modules
// ---------------------------------------------------------------------------

// Returns the amount of selected symptoms of each Manchester level.
// Only looks at the symptoms block.
export function getPatientRisk() {
  const patientRisk = { red: 0, orange: 0, yellow: 0, green: 0, blue: 0 };

  selected.forEach((symptom) => {
    patientRisk[LEVEL_KEY[symptom.level]]++;
  });

  return patientRisk;
}

// Returns a copy of the selected symptoms: { id, level, location, text }
export function getSelectedSymptoms() {
  return selected.map((symptom) => ({ ...symptom }));
}

// Fires whenever the list changes, so a future overall-risk module can react
// without polling:
//   document.addEventListener("symptoms:change", (e) => e.detail.risk)
function notifyChange() {
  symptomsBlock.dispatchEvent(
    new CustomEvent("symptoms:change", {
      bubbles: true,
      detail: { symptoms: getSelectedSymptoms(), risk: getPatientRisk() }
    })
  );
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
addButton.addEventListener("click", openPopup);
popupClose.addEventListener("click", closePopup);

popup.addEventListener("click", (event) => {
  if (event.target === popup) closePopup(); // click on the backdrop
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !popup.classList.contains("hidden")) closePopup();
});

popupSearch.addEventListener("input", renderPopupList);

popupFilters.addEventListener("click", (event) => {
  const button = event.target.closest(".symptom-popup__filter");
  if (!button) return;

  setActiveFilter(button.dataset.location);
  renderPopupList();
});

popupList.addEventListener("click", (event) => {
  const button = event.target.closest(".symptom-popup__item");
  if (!button || button.disabled) return;

  addSymptom(button.dataset.id);
  closePopup();
});

symptomList.addEventListener("click", (event) => {
  const button = event.target.closest(".symptoms__remove");
  if (!button) return;

  removeSymptom(button.closest(".symptoms__item").dataset.id);
});