const STORAGE_KEY = "rundom-food-app-state-v1";
const DIET_TAGS = ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free"];
const COLORS = ["#e2533f", "#0f766e", "#f4b942", "#3b82f6", "#8b5cf6", "#f97316", "#14b8a6", "#ef4444"];
const HEART_EMPTY = "\u2661";
const HEART_FILLED = "\u2665";

const builtInMeals = [
  { id: "meal-1", type: "meal", name: "Thai basil chicken", description: "Fast stir-fry with rice, egg, and lots of basil.", tags: ["dairy-free"] },
  { id: "meal-2", type: "meal", name: "Tomato egg noodles", description: "Comfort noodles with a quick tomato and egg sauce.", tags: ["vegetarian", "dairy-free"] },
  { id: "meal-3", type: "meal", name: "Chickpea curry", description: "Pantry curry with coconut milk, chickpeas, and greens.", tags: ["vegan", "vegetarian", "halal", "gluten-free", "dairy-free"] },
  { id: "meal-4", type: "meal", name: "Salmon rice bowl", description: "Seared salmon, cucumber, rice, and spicy mayo.", tags: ["gluten-free"] },
  { id: "meal-5", type: "meal", name: "Tofu fried rice", description: "Crispy tofu, vegetables, and leftover rice.", tags: ["vegan", "vegetarian", "dairy-free"] },
  { id: "meal-6", type: "meal", name: "Chicken soup", description: "Simple broth, vegetables, herbs, and noodles.", tags: ["halal", "dairy-free"] }
];

const sampleRestaurants = [
   
  { id: "rest-1", type: "restaurant", name: "Rice & Roll", description: "Sushi rolls, donburi, and miso soup.", cuisine: "Japanese", rating: 4.5, distance: 2.6, tags: ["dairy-free"] },
  
  
];

const defaultState = {
  signedIn: false,
  user: {
    name: "Guest Foodie",
    email: "Sign in to sync later",
    avatar: ""
  },
  mode: "meal",
  dietFilters: [],
  radius: 5,
  customItems: [],
  favorites: [],
  history: [],
  rotation: 0,
  currentResult: null,
  location: null
};

let state = loadState();
let wheelItems = [];
let spinning = false;

const el = {
  navTabs: document.querySelectorAll(".nav-tab"),
  pages: document.querySelectorAll(".page"),
  authButton: document.querySelector("#authButton"),
  profileName: document.querySelector("#profileName"),
  profileEmail: document.querySelector("#profileEmail"),
  profileAvatar: document.querySelector("#profileAvatar"),
  modeButtons: document.querySelectorAll(".mode-button"),
  wheelCanvas: document.querySelector("#wheelCanvas"),
  spinButton: document.querySelector("#spinButton"),
  poolCount: document.querySelector("#poolCount"),
  resultName: document.querySelector("#resultName"),
  resultDescription: document.querySelector("#resultDescription"),
  resultTags: document.querySelector("#resultTags"),
  favoriteButton: document.querySelector("#favoriteButton"),
  mapLink: document.querySelector("#mapLink"),
  historyList: document.querySelector("#historyList"),
  clearHistoryButton: document.querySelector("#clearHistoryButton"),
  foodForm: document.querySelector("#foodForm"),
  editingId: document.querySelector("#editingId"),
  foodName: document.querySelector("#foodName"),
  foodCategory: document.querySelector("#foodCategory"),
  foodNotes: document.querySelector("#foodNotes"),
  foodDietTags: document.querySelector("#foodDietTags"),
  resetFormButton: document.querySelector("#resetFormButton"),
  foodList: document.querySelector("#foodList"),
  favoritesList: document.querySelector("#favoritesList"),
  settingsDietFilters: document.querySelector("#settingsDietFilters"),
  radiusRange: document.querySelector("#radiusRange"),
  radiusLabel: document.querySelector("#radiusLabel"),
  locationButton: document.querySelector("#locationButton"),
  locationStatus: document.querySelector("#locationStatus")
};

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(defaultState);

  try {
    return { ...structuredClone(defaultState), ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function init() {
  renderDietChecks(el.foodDietTags, [], "food-tag");
  bindEvents();
  renderAll();
}

function bindEvents() {
  el.navTabs.forEach((button) => {
    button.addEventListener("click", () => showPage(button.dataset.page));
  });

  el.authButton.addEventListener("click", toggleAuth);

  el.modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      state.currentResult = null;
      saveState();
      renderAll();
    });
  });

  el.spinButton.addEventListener("click", spin);
  el.favoriteButton.addEventListener("click", toggleCurrentFavorite);
  el.clearHistoryButton.addEventListener("click", () => {
    state.history = [];
    saveState();
    renderHistory();
  });

  el.foodForm.addEventListener("submit", saveFoodItem);
  el.resetFormButton.addEventListener("click", resetFoodForm);

  el.radiusRange.addEventListener("input", () => {
    state.radius = Number(el.radiusRange.value);
    saveState();
    renderAll();
  });

  el.locationButton.addEventListener("click", requestLocation);
}

function showPage(pageName) {
  el.navTabs.forEach((button) => button.classList.toggle("active", button.dataset.page === pageName));
  el.pages.forEach((page) => page.classList.toggle("active", page.id === `page-${pageName}`));
}

function toggleAuth() {
  state.signedIn = !state.signedIn;
  state.user = state.signedIn
    ? { name: "Demo Google User", email: "demo.foodie@gmail.com", avatar: "" }
    : structuredClone(defaultState.user);
  saveState();
  renderProfile();
}

function getActiveItems() {
  const custom = state.customItems.map((item) => ({
    ...item,
    type: item.category,
    description: item.notes || "Custom food item"
  }));

  const pool = state.mode === "meal"
    ? [...builtInMeals, ...custom.filter((item) => item.type === "meal")]
    : [...sampleRestaurants, ...custom.filter((item) => item.type === "restaurant")];

  return pool
    .filter((item) => state.mode !== "restaurant" || Number(item.distance || 0) <= state.radius || item.id.startsWith("custom-"))
    .filter((item) => state.dietFilters.every((tag) => item.tags?.includes(tag)));
}

function renderAll() {
  wheelItems = getActiveItems();
  renderProfile();
  renderMode();
  renderWheel();
  renderResult();
  renderHistory();
  renderFoodList();
  renderFavorites();
  renderSettings();
}

function renderProfile() {
  el.authButton.textContent = state.signedIn ? "Sign out" : "Sign in with Google";
  el.profileName.textContent = state.user.name;
  el.profileEmail.textContent = state.user.email;
  el.profileAvatar.textContent = state.user.name.slice(0, 1).toUpperCase();
}

function renderMode() {
  el.modeButtons.forEach((button) => button.classList.toggle("active", button.dataset.mode === state.mode));
  el.poolCount.textContent = `${wheelItems.length} option${wheelItems.length === 1 ? "" : "s"}`;
}

function renderWheel() {
  const ctx = el.wheelCanvas.getContext("2d");
  const size = el.wheelCanvas.width;
  const center = size / 2;
  const radius = center - 18;
  const items = wheelItems.length ? wheelItems : [{ name: "Add food", tags: [] }];
  const slice = (Math.PI * 2) / items.length;

  ctx.clearRect(0, 0, size, size);

  items.forEach((item, index) => {
    const start = index * slice;
    const end = start + slice;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = COLORS[index % COLORS.length];
    ctx.fill();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(start + slice / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "800 21px Inter, sans-serif";
    ctx.fillText(truncate(item.name, 18), radius - 24, 8);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.lineWidth = 14;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();

  el.wheelCanvas.style.transform = `rotate(${state.rotation}deg)`;
}

function spin() {
  if (spinning || !wheelItems.length) return;

  spinning = true;
  el.spinButton.disabled = true;
  const index = Math.floor(Math.random() * wheelItems.length);
  const sliceDeg = 360 / wheelItems.length;
  const selectedCenter = index * sliceDeg + sliceDeg / 2;
  const targetAtPointer = 0;
  const extraTurns = 5 + Math.floor(Math.random() * 3);
  state.rotation = state.rotation + extraTurns * 360 + targetAtPointer - selectedCenter - (state.rotation % 360);

  saveState();
  renderWheel();

  window.setTimeout(() => {
    state.currentResult = wheelItems[index];
    state.history.unshift({
      id: crypto.randomUUID(),
      itemName: state.currentResult.name,
      type: state.currentResult.type,
      pickedAt: new Date().toISOString()
    });
    state.history = state.history.slice(0, 30);
    spinning = false;
    el.spinButton.disabled = false;
    saveState();
    renderResult();
    renderHistory();
  }, 4100);
}

function renderResult() {
  const item = state.currentResult;
  if (!item) {
    el.resultName.textContent = wheelItems.length ? "Ready when you are" : "No matching options";
    el.resultDescription.textContent = wheelItems.length
      ? "Spin the wheel and let dinner decide itself."
      : "Add custom items or loosen your filters to fill the wheel.";
    el.resultTags.innerHTML = "";
    el.favoriteButton.classList.remove("saved");
    el.favoriteButton.textContent = HEART_EMPTY;
    el.mapLink.classList.add("hidden");
    return;
  }

  el.resultName.textContent = item.name;
  el.resultDescription.textContent = describeItem(item);
  el.resultTags.innerHTML = tagHtml(item);
  const saved = isFavorite(item);
  el.favoriteButton.classList.toggle("saved", saved);
  el.favoriteButton.textContent = saved ? HEART_FILLED : HEART_EMPTY;

  if (item.type === "restaurant") {
    el.mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name)}`;
    el.mapLink.classList.remove("hidden");
  } else {
    el.mapLink.classList.add("hidden");
  }
}

function describeItem(item) {
  if (item.type === "restaurant") {
    const details = [item.cuisine, item.rating ? `${item.rating} stars` : "", item.distance ? `${item.distance} km` : ""].filter(Boolean).join(" / ");
    return `${item.description || "Restaurant suggestion"}${details ? ` ${details}.` : ""}`;
  }
  return item.description || item.notes || "Meal idea for cooking at home.";
}

function tagHtml(item) {
  return (item.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("");
}

function toggleCurrentFavorite() {
  const item = state.currentResult;
  if (!item) return;

  if (isFavorite(item)) {
    state.favorites = state.favorites.filter((favorite) => favorite.itemName !== item.name || favorite.type !== item.type);
  } else {
    state.favorites.unshift({
      id: crypto.randomUUID(),
      itemName: item.name,
      type: item.type,
      description: describeItem(item),
      tags: item.tags || [],
      savedAt: new Date().toISOString()
    });
  }

  saveState();
  renderResult();
  renderFavorites();
}

function isFavorite(item) {
  return state.favorites.some((favorite) => favorite.itemName === item.name && favorite.type === item.type);
}

function saveFoodItem(event) {
  event.preventDefault();
  const tags = [...document.querySelectorAll("input[name='food-tag']:checked")].map((input) => input.value);
  const item = {
    id: el.editingId.value || `custom-${crypto.randomUUID()}`,
    userId: "local-user",
    name: el.foodName.value.trim(),
    category: el.foodCategory.value,
    tags,
    notes: el.foodNotes.value.trim(),
    createdAt: new Date().toISOString()
  };

  if (!item.name) return;

  const existingIndex = state.customItems.findIndex((entry) => entry.id === item.id);
  if (existingIndex >= 0) {
    state.customItems[existingIndex] = item;
  } else {
    state.customItems.unshift(item);
  }

  resetFoodForm();
  saveState();
  renderAll();
}

function resetFoodForm() {
  el.foodForm.reset();
  el.editingId.value = "";
  renderDietChecks(el.foodDietTags, [], "food-tag");
}

function editFoodItem(id) {
  const item = state.customItems.find((entry) => entry.id === id);
  if (!item) return;

  el.editingId.value = item.id;
  el.foodName.value = item.name;
  el.foodCategory.value = item.category;
  el.foodNotes.value = item.notes;
  renderDietChecks(el.foodDietTags, item.tags, "food-tag");
  showPage("list");
}

function deleteFoodItem(id) {
  state.customItems = state.customItems.filter((entry) => entry.id !== id);
  saveState();
  renderAll();
}

function renderFoodList() {
  const items = state.customItems;
  el.foodList.innerHTML = items.length
    ? items.map((item) => `
      <article class="card">
        <h3>${escapeHtml(item.name)}</h3>
        <p>${item.category === "meal" ? "Meal at home" : "Restaurant"} / ${escapeHtml(item.notes || "No notes")}</p>
        <div class="tag-row">${tagHtml(item)}</div>
        <div class="card-actions">
          <button class="secondary-button" type="button" data-edit="${item.id}">Edit</button>
          <button class="secondary-button" type="button" data-delete="${item.id}">Delete</button>
        </div>
      </article>
    `).join("")
    : emptyCard("No custom food yet", "Add meals or restaurants above to personalize the wheel.");

  el.foodList.querySelectorAll("[data-edit]").forEach((button) => button.addEventListener("click", () => editFoodItem(button.dataset.edit)));
  el.foodList.querySelectorAll("[data-delete]").forEach((button) => button.addEventListener("click", () => deleteFoodItem(button.dataset.delete)));
}

function renderFavorites() {
  el.favoritesList.innerHTML = state.favorites.length
    ? state.favorites.map((favorite) => `
      <article class="card">
        <h3>${escapeHtml(favorite.itemName)}</h3>
        <p>${escapeHtml(favorite.description || favorite.type)}</p>
        <div class="tag-row">${tagHtml({ tags: favorite.tags })}</div>
        <div class="card-actions">
          <button class="secondary-button" type="button" data-remove-favorite="${favorite.id}">Remove</button>
        </div>
      </article>
    `).join("")
    : emptyCard("No favorites saved", "Spin the wheel, then tap the heart to keep a result.");

  el.favoritesList.querySelectorAll("[data-remove-favorite]").forEach((button) => {
    button.addEventListener("click", () => {
      state.favorites = state.favorites.filter((favorite) => favorite.id !== button.dataset.removeFavorite);
      saveState();
      renderAll();
    });
  });
}

function renderHistory() {
  el.historyList.innerHTML = state.history.length
    ? state.history.slice(0, 8).map((entry) => `
      <div class="compact-row">
        <strong>${escapeHtml(entry.itemName)}</strong>
        <span>${entry.type} / ${new Date(entry.pickedAt).toLocaleDateString()}</span>
      </div>
    `).join("")
    : "No picks yet.";
}

function renderSettings() {
  renderDietChecks(el.settingsDietFilters, state.dietFilters, "settings-filter");
  el.settingsDietFilters.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", () => {
      state.dietFilters = [...el.settingsDietFilters.querySelectorAll("input:checked")].map((check) => check.value);
      state.currentResult = null;
      saveState();
      renderAll();
    });
  });

  el.radiusRange.value = state.radius;
  el.radiusLabel.textContent = `${state.radius} km`;
  el.locationStatus.textContent = state.location
    ? `Using ${state.location.latitude.toFixed(3)}, ${state.location.longitude.toFixed(3)}`
    : "No location selected.";
}

function renderDietChecks(container, selected, name) {
  container.innerHTML = DIET_TAGS.map((tag) => `
    <label class="check-pill">
      <input type="checkbox" name="${name}" value="${tag}" ${selected.includes(tag) ? "checked" : ""} />
      <span>${tag}</span>
    </label>
  `).join("");
}

function requestLocation() {
  if (!navigator.geolocation) {
    el.locationStatus.textContent = "Location is not supported by this browser.";
    return;
  }

  el.locationStatus.textContent = "Requesting location...";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      state.location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      saveState();
      renderSettings();
    },
    () => {
      el.locationStatus.textContent = "Location permission was not granted.";
    }
  );
}

function emptyCard(title, message) {
  return `
    <article class="card">
      <h3>${title}</h3>
      <p>${message}</p>
    </article>
  `;
}

function truncate(value, max) {
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[char]);
}

init();
