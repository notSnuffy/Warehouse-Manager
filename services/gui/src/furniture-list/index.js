import "./styles.scss";
import * as _bootstrap from "bootstrap";
import { API_URL } from "../config";
import {
  paginateList,
  renderPaginationControls,
} from "../lib/functions/pagination";

const furnitureListElement = document.getElementById("furnitureList");
const furnitureSuggestionsElement = document.getElementById(
  "furnitureSuggestions",
);
const searchInputElement = document.getElementById("searchInput");
const sortOrderElement = document.getElementById("sortOrder");
const itemsPerPageElement = document.getElementById("itemsPerPage");
const paginationControlsElement = document.getElementById("paginationControls");
const addFurnitureButtonElement = document.getElementById("addFurnitureButton");
const furnitureListItemTemplateElement = document.getElementById(
  "furnitureListItemTemplate",
);

const furniture = {};
let currentPage = 1;
let itemsPerPage = parseInt(itemsPerPageElement.value, 10);

const testFurniture = fillFurnitureWithTestData();
Object.keys(testFurniture).forEach((key) => {
  furniture[key] = testFurniture[key];
});

init();

function fillFurnitureWithTestData() {
  const testFurniture = {};

  for (let i = 1; i <= 1010; i++) {
    testFurniture[i] = {
      id: i,
      name: `Furniture ${i}`,
    };
  }
  return testFurniture;
}

async function init() {
  await fetchFurniture();
  renderFurniture();
  populateFurnitureSuggestions();
}

searchInputElement.addEventListener("input", () => {
  currentPage = 1;
  renderFurniture();
});

sortOrderElement.addEventListener("change", () => {
  currentPage = 1;
  renderFurniture();
});

itemsPerPageElement.addEventListener("change", () => {
  itemsPerPage = parseInt(itemsPerPageElement.value, 10);
  currentPage = 1;
  renderFurniture();
});

addFurnitureButtonElement.addEventListener("click", () => {
  window.location.href = "/";
});

async function fetchFurniture() {
  try {
    const response = await fetch(API_URL + "/furniture-management/furniture");
    const data = await response.json();
    console.log("Fetched furniture data:", data);
    if (!response.ok) {
      if (data.errors && data.errors.length > 0) {
        alert(data.errors.join("\n"));
      }
      console.error("Failed to fetch furniture:", data);
    }
    data.forEach((furnitureData) => {
      furniture[furnitureData.id] = furnitureData;
    });
  } catch (error) {
    console.error("Error fetching furniture:", error);
  }
}

function renderFurniture() {
  furnitureListElement.innerHTML = "";
  const filteredFurniture = filterFurniture();
  const paginatedFurniture = paginateList(
    filteredFurniture,
    currentPage,
    itemsPerPage,
  );
  paginatedFurniture.forEach((furniture) => {
    addFurnitureToList(furniture);
  });
  renderPaginationControls(
    filteredFurniture,
    currentPage,
    itemsPerPage,
    paginationControlsElement,
    (page) => {
      currentPage = page;
      renderFurniture();
    },
  );
}

function editFurniture(id) {
  window.location.href = `/editors/furniture-editor/?furnitureId=${id}`;
}

async function removeFurniture(id) {
  if (!confirm("Are you sure you want to remove this furniture?")) {
    return; // User canceled the deletion
  }
  try {
    //const response = await fetch(API_URL + `/furniture-management/furniture/${id}`, {
    //  method: "DELETE",
    //});
    //if (!response.ok) {
    //  throw new Error("Network response was not ok");
    //}
    // Remove the furniture from the list
    //}

    // Technically, we could remove just the specific furniture from the DOM,
    // but for simplicity, we re-render the entire list.
    delete furniture[id];

    const totalPages = Math.ceil(Object.keys(furniture).length / itemsPerPage);
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }
    renderFurniture();
    populateFurnitureSuggestions();
  } catch (error) {
    console.error("Error removing furniture:", error);
  }
}

function addFurnitureToList(furniture) {
  const clone = furnitureListItemTemplateElement.content.cloneNode(true);

  clone.querySelector(".furniture-name").textContent = furniture.name;

  clone
    .querySelector(".edit-button")
    .addEventListener("click", () => editFurniture(furniture.id));
  clone
    .querySelector(".remove-button")
    .addEventListener("click", () => removeFurniture(furniture.id));

  furnitureListElement.appendChild(clone);
}

function populateFurnitureSuggestions() {
  furnitureSuggestionsElement.innerHTML = "";
  Object.values(furniture).forEach((furniture) => {
    const option = document.createElement("option");
    option.value = furniture.name;
    option.textContent = furniture.name;
    furnitureSuggestionsElement.appendChild(option);
  });
}

function filterFurniture() {
  const searchInput = searchInputElement.value.toLowerCase();
  const sortOrder = sortOrderElement.value;

  const filteredFurniture = Object.values(furniture).filter((furniture) =>
    furniture.name.toLowerCase().includes(searchInput),
  );

  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
  });
  switch (sortOrder) {
    case "name_ascending":
      filteredFurniture.sort((a, b) => collator.compare(a.name, b.name));
      break;
    case "name_descending":
      filteredFurniture.sort((a, b) => collator.compare(b.name, a.name));
      break;
    case "date_ascending":
      filteredFurniture.sort((a, b) => a.id - b.id);
      break;
    case "date_descending":
      filteredFurniture.sort((a, b) => b.id - a.id);
      break;
  }

  return filteredFurniture;
}
