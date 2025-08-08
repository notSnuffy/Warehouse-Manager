import "./styles.scss";
import * as _bootstrap from "bootstrap";
import { API_URL } from "../config";
import {
  paginateList,
  renderPaginationControls,
} from "../lib/functions/pagination";

const floorListElement = document.getElementById("floorList");
const floorSuggestionsElement = document.getElementById("floorSuggestions");
const searchInputElement = document.getElementById("searchInput");
const sortOrderElement = document.getElementById("sortOrder");
const itemsPerPageElement = document.getElementById("itemsPerPage");
const paginationControlsElement = document.getElementById("paginationControls");
const addFloorButtonElement = document.getElementById("addFloorButton");
const floorListItemTemplateElement = document.getElementById(
  "floorListItemTemplate",
);

const floors = {};
let currentPage = 1;
let itemsPerPage = parseInt(itemsPerPageElement.value, 10);

const testFloors = fillFloorsWithTestData();
Object.keys(testFloors).forEach((key) => {
  floors[key] = testFloors[key];
});

init();

function fillFloorsWithTestData() {
  const testFloors = {};

  for (let i = 1; i <= 1010; i++) {
    testFloors[i] = {
      id: i,
      name: `Floor ${i}`,
    };
  }
  return testFloors;
}

async function init() {
  //await fetchFloors();
  renderFloors();
  populateFloorSuggestions();
}

searchInputElement.addEventListener("input", () => {
  currentPage = 1;
  renderFloors();
});

sortOrderElement.addEventListener("change", () => {
  currentPage = 1;
  renderFloors();
});

itemsPerPageElement.addEventListener("change", () => {
  itemsPerPage = parseInt(itemsPerPageElement.value, 10);
  currentPage = 1;
  renderFloors();
});

addFloorButtonElement.addEventListener("click", () => {
  window.location.href = "/";
});

async function _fetchFloors() {
  try {
    const response = await fetch(API_URL + "/floor-management/floors");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    data.forEach((floor) => {
      floors[floor.id] = floor;
    });
  } catch (error) {
    console.error("Error fetching floors:", error);
  }
}

function renderFloors() {
  floorListElement.innerHTML = "";
  const filteredFloors = filterFloors();
  const paginatedFloors = paginateList(
    filteredFloors,
    currentPage,
    itemsPerPage,
  );
  paginatedFloors.forEach((floor) => {
    addFloorToList(floor);
  });
  renderPaginationControls(
    filteredFloors,
    currentPage,
    itemsPerPage,
    paginationControlsElement,
    (page) => {
      currentPage = page;
      renderFloors();
    },
  );
}

function editFloor(id) {
  window.location.href = `/?id=${id}`;
}

async function removeFloor(id) {
  if (!confirm("Are you sure you want to remove this floor?")) {
    return; // User canceled the deletion
  }
  try {
    //const response = await fetch(API_URL + `/floor-management/floors/${id}`, {
    //  method: "DELETE",
    //});
    //if (!response.ok) {
    //  throw new Error("Network response was not ok");
    //}
    // Remove the floor from the list
    //}

    // Technically, we could remove just the specific floor from the DOM,
    // but for simplicity, we re-render the entire list.
    delete floors[id];

    const totalPages = Math.ceil(Object.keys(floors).length / itemsPerPage);
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }
    renderFloors();
    populateFloorSuggestions();
  } catch (error) {
    console.error("Error removing floor:", error);
  }
}

function addFloorToList(floor) {
  const clone = floorListItemTemplateElement.content.cloneNode(true);

  clone.querySelector(".floor-name").textContent = floor.name;

  clone
    .querySelector(".edit-button")
    .addEventListener("click", () => editFloor(floor.id));
  clone
    .querySelector(".remove-button")
    .addEventListener("click", () => removeFloor(floor.id));

  floorListElement.appendChild(clone);
}

function populateFloorSuggestions() {
  floorSuggestionsElement.innerHTML = "";
  Object.values(floors).forEach((floor) => {
    const option = document.createElement("option");
    option.value = floor.name;
    option.textContent = floor.name;
    floorSuggestionsElement.appendChild(option);
  });
}

function filterFloors() {
  const searchInput = searchInputElement.value.toLowerCase();
  const sortOrder = sortOrderElement.value;

  const filteredFloors = Object.values(floors).filter((floor) =>
    floor.name.toLowerCase().includes(searchInput),
  );

  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
  });
  switch (sortOrder) {
    case "name_ascending":
      filteredFloors.sort((a, b) => collator.compare(a.name, b.name));
      break;
    case "name_descending":
      filteredFloors.sort((a, b) => collator.compare(b.name, a.name));
      break;
    case "date_ascending":
      filteredFloors.sort((a, b) => a.id - b.id);
      break;
    case "date_descending":
      filteredFloors.sort((a, b) => b.id - a.id);
      break;
  }

  return filteredFloors;
}
