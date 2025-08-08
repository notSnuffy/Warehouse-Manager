import "./styles.scss";
import * as _bootstrap from "bootstrap";
import { API_URL } from "../config";
import {
  paginateList,
  renderPaginationControls,
} from "../lib/functions/pagination";

const shapeListElement = document.getElementById("shapeList");
const shapeSuggestionsElement = document.getElementById("shapeSuggestions");
const searchInputElement = document.getElementById("searchInput");
const sortOrderElement = document.getElementById("sortOrder");
const itemsPerPageElement = document.getElementById("itemsPerPage");
const paginationControlsElement = document.getElementById("paginationControls");
const addShapeButtonElement = document.getElementById("addShapeButton");
const shapeListItemTemplateElement = document.getElementById(
  "shapeListItemTemplate",
);

const shapes = {};
let currentPage = 1;
let itemsPerPage = parseInt(itemsPerPageElement.value, 10);

const testShapes = fillShapesWithTestData();
Object.keys(testShapes).forEach((key) => {
  shapes[key] = testShapes[key];
});

init();

function fillShapesWithTestData() {
  const testShapes = {};

  for (let i = 1; i <= 1010; i++) {
    testShapes[i] = {
      id: i,
      name: `Shape ${i}`,
    };
  }
  return testShapes;
}

async function init() {
  await fetchShapes();
  renderShapes();
  populateShapeSuggestions();
}

searchInputElement.addEventListener("input", () => {
  currentPage = 1;
  renderShapes();
});

sortOrderElement.addEventListener("change", () => {
  currentPage = 1;
  renderShapes();
});

itemsPerPageElement.addEventListener("change", () => {
  itemsPerPage = parseInt(itemsPerPageElement.value, 10);
  currentPage = 1;
  renderShapes();
});

addShapeButtonElement.addEventListener("click", () => {
  window.location.href = "/";
});

async function fetchShapes() {
  try {
    const response = await fetch(API_URL + "/shape-management/shapes");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    data.forEach((shape) => {
      shapes[shape.id] = shape;
    });
  } catch (error) {
    console.error("Error fetching shapes:", error);
  }
}

function renderShapes() {
  shapeListElement.innerHTML = "";
  const filteredShapes = filterShapes();
  const paginatedShapes = paginateList(
    filteredShapes,
    currentPage,
    itemsPerPage,
  );
  paginatedShapes.forEach((shape) => {
    addShapeToList(shape);
  });
  renderPaginationControls(
    filteredShapes,
    currentPage,
    itemsPerPage,
    paginationControlsElement,
    (page) => {
      currentPage = page;
      renderShapes();
    },
  );
}

function editShape(id) {
  window.location.href = `/?id=${id}`;
}

async function removeShape(id) {
  if (!confirm("Are you sure you want to remove this shape?")) {
    return; // User canceled the deletion
  }
  try {
    //const response = await fetch(API_URL + `/shape-management/shapes/${id}`, {
    //  method: "DELETE",
    //});
    //if (!response.ok) {
    //  throw new Error("Network response was not ok");
    //}
    // Remove the shape from the list
    //}

    // Technically, we could remove just the specific shape from the DOM,
    // but for simplicity, we re-render the entire list.
    delete shapes[id];

    const totalPages = Math.ceil(Object.keys(shapes).length / itemsPerPage);
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }
    renderShapes();
    populateShapeSuggestions();
  } catch (error) {
    console.error("Error removing shape:", error);
  }
}

function addShapeToList(shape) {
  const clone = shapeListItemTemplateElement.content.cloneNode(true);

  clone.querySelector(".shape-name").textContent = shape.name;

  clone
    .querySelector(".edit-button")
    .addEventListener("click", () => editShape(shape.id));
  clone
    .querySelector(".remove-button")
    .addEventListener("click", () => removeShape(shape.id));

  shapeListElement.appendChild(clone);
}

function populateShapeSuggestions() {
  shapeSuggestionsElement.innerHTML = "";
  Object.values(shapes).forEach((shape) => {
    const option = document.createElement("option");
    option.value = shape.name;
    option.textContent = shape.name;
    shapeSuggestionsElement.appendChild(option);
  });
}

function filterShapes() {
  const searchInput = searchInputElement.value.toLowerCase();
  const sortOrder = sortOrderElement.value;

  const filteredShapes = Object.values(shapes).filter((shape) =>
    shape.name.toLowerCase().includes(searchInput),
  );

  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
  });
  switch (sortOrder) {
    case "name_ascending":
      filteredShapes.sort((a, b) => collator.compare(a.name, b.name));
      break;
    case "name_descending":
      filteredShapes.sort((a, b) => collator.compare(b.name, a.name));
      break;
    case "date_ascending":
      filteredShapes.sort((a, b) => a.id - b.id);
      break;
    case "date_descending":
      filteredShapes.sort((a, b) => b.id - a.id);
      break;
  }

  return filteredShapes;
}
