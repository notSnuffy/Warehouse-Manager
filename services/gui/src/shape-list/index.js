import "./styles.scss";
import * as _bootstrap from "bootstrap";
import { API_URL } from "../config";

const shapeListElement = document.getElementById("shapeList");
const shapeSuggestionsElement = document.getElementById("shapeSuggestions");
const searchInputElement = document.getElementById("searchInput");
const sortOrderElement = document.getElementById("sortOrder");
const itemsPerPageElement = document.getElementById("itemsPerPage");
const paginationControlsElement = document.getElementById("paginationControls");
const addShapeButtonElement = document.getElementById("addShapeButton");

const shapes = {};
let currentPage = 1;
let itemsPerPage = parseInt(itemsPerPageElement.value, 10);

const testShapes = fillShapesWithTestData(); // Fill with test data for initial rendering
Object.keys(testShapes).forEach((key) => {
  shapes[key] = testShapes[key]; // Initialize shapes with test data
});

init();

function fillShapesWithTestData() {
  const testShapes = {};

  for (let i = 1; i <= 1010; i++) {
    testShapes[i] = {
      id: i,
      name: `Shape ${i}`,
      type: "circle",
      color: "red",
      size: 10 + i,
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
  currentPage = 1; // Reset to the first page on search input change
  renderShapes(); // Re-render shapes on search input change
});

sortOrderElement.addEventListener("change", () => {
  currentPage = 1; // Reset to the first page on sort order change
  renderShapes(); // Re-render shapes on sort order change
});

itemsPerPageElement.addEventListener("change", () => {
  itemsPerPage = parseInt(itemsPerPageElement.value, 10);
  currentPage = 1; // Reset to the first page on items per page change
  renderShapes(); // Re-render shapes on items per page change
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
      shapes[shape.id] = shape; // Store the shape in the shapes object
    });
  } catch (error) {
    console.error("Error fetching shapes:", error);
  }
}

function paginateShapes(shapes) {
  const totalShapes = shapes.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalShapes);
  return shapes.slice(startIndex, endIndex);
}

function renderShapes() {
  shapeListElement.innerHTML = ""; // Clear the list
  const filteredShapes = filterShapes();
  const paginatedShapes = paginateShapes(filteredShapes);
  paginatedShapes.forEach((shape) => {
    addShapeToList(shape);
  });
  renderPaginationControls(filteredShapes); // Render pagination controls
}

function renderPaginationControls(shapes) {
  const totalPages = Math.ceil(shapes.length / itemsPerPage);
  const maxVisiblePages = 5;
  paginationControlsElement.innerHTML = "";

  if (totalPages <= 1) {
    return;
  }
  const createPageItem = (
    setPage,
    itemLabel = setPage,
    active = false,
    disabled = false,
  ) => {
    const li = document.createElement("li");
    li.className = `page-item ${active ? "active" : ""}${disabled ? "disabled" : ""}`;
    li.innerHTML = `<a class="page-link" href="#">${itemLabel}</a>`;
    if (!disabled && !active) {
      li.addEventListener("click", () => {
        currentPage = setPage;
        renderShapes();
      });
    }
    return li;
  };

  paginationControlsElement.appendChild(
    createPageItem(currentPage - 1, "Previous", false, currentPage === 1),
  );

  const addEllipsis = () => {
    const li = document.createElement("li");
    li.className = "page-item disabled";
    li.innerHTML = `<span class="page-link">…</span>`;
    paginationControlsElement.appendChild(li);
  };

  let startPage = Math.max(currentPage - 2, 1);
  let endPage = Math.min(currentPage + 2, totalPages);

  if (currentPage <= 3) {
    endPage = Math.min(maxVisiblePages, totalPages);
  } else if (currentPage >= totalPages - 2) {
    startPage = Math.max(totalPages - maxVisiblePages + 1, 1);
  }

  if (startPage > 1) {
    paginationControlsElement.appendChild(createPageItem(1));
    if (startPage > 2) addEllipsis();
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationControlsElement.appendChild(
      createPageItem(i, i, i === currentPage),
    );
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) addEllipsis();
    paginationControlsElement.appendChild(createPageItem(totalPages));
  }

  paginationControlsElement.appendChild(
    createPageItem(currentPage + 1, "Next", false, currentPage === totalPages),
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
    delete shapes[id]; // Remove the shape from the shapes object
    renderShapes(); // Re-render the shapes list
    populateShapeSuggestions(); // Update the shape suggestions
  } catch (error) {
    console.error("Error removing shape:", error);
  }
}

function addShapeToList(shape) {
  const li = document.createElement("li");
  li.textContent = shape.name;
  li.classList.add("list-group-item");

  const editButton = document.createElement("button");
  editButton.textContent = "Edit";
  editButton.classList.add("btn", "btn-primary", "btn-sm", "float-end", "me-2");
  editButton.addEventListener("click", () => editShape(shape.id));

  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.classList.add("btn", "btn-danger", "btn-sm", "float-end");
  removeButton.addEventListener("click", () => removeShape(shape.id));

  const buttonGroup = document.createElement("div");
  buttonGroup.classList.add("btn-group", "float-end");
  buttonGroup.appendChild(editButton);
  buttonGroup.appendChild(removeButton);

  li.appendChild(buttonGroup);

  shapeListElement.appendChild(li);
}

function populateShapeSuggestions() {
  shapeSuggestionsElement.innerHTML = ""; // Clear previous suggestions
  Object.values(shapes).forEach((shape) => {
    const option = document.createElement("option");
    option.value = shape.id;
    option.textContent = shape.name;
    shapeSuggestionsElement.appendChild(option);
  });
}

function filterShapes() {
  const searchInput = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const sortOrder = document.getElementById("sortOrder").value;

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
