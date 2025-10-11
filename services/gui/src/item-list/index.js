import "./styles.scss";
import { Modal } from "bootstrap";
import * as _bootstrap from "bootstrap";
import { API_URL } from "@/config";
import { paginateList, renderPaginationControls } from "@utils/pagination";
import {
  initializeAddNewItem,
  initializeEditItem,
  initializeItemModalCategories,
} from "./itemModal";

const itemTableBodyElement = document.getElementById("itemTableBody");
const itemTemplateElement = document.getElementById("itemTemplate");
const searchInputElement = document.getElementById("searchInput");
const itemsPerPageElement = document.getElementById("itemsPerPage");
const sortOrderElement = document.getElementById("sortOrder");
const paginationControlsElement = document.getElementById("paginationControls");
const itemSuggestionsElement = document.getElementById("itemSuggestions");

const items = {};
let currentPage = 1;
let itemsPerPage = parseInt(itemsPerPageElement.value, 10);

const SORT_COLUMNS = {
  NAME: "name",
  ID: "id",
  CATEGORY: "category",
  QUANTITY: "quantity",
  DESCRIPTION: "description",
};

const SORT_DIRECTIONS = {
  ASCENDING: "ascending",
  DESCENDING: "descending",
};

const SORT_MODES = {
  ALPHABETICAL: "alphabetical",
  DATE: "date",
};

let sortColumn = SORT_COLUMNS.NAME;
let sortDirection = SORT_DIRECTIONS.ASCENDING;
let sortMode = SORT_MODES.ALPHABETICAL;

const testItems = fillItemsWithTestData();
Object.keys(testItems).forEach((key) => {
  items[key] = testItems[key];
});

init();

function fillItemsWithTestData() {
  const testItems = {};

  for (let i = 1; i <= 1013; i++) {
    testItems[i] = {
      id: i,
      name: `Item ${i}`,
      category: "Sample Category" + Math.floor(Math.random() * 1000),
      quantity: `${Math.floor(Math.random() * 1000)} pieces`,
      description: `${Math.floor(Math.random() * 1000)} Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut 
                    labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut 
                    aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
                    fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
    };
  }
  return testItems;
}

async function init() {
  await fetchItems();
  renderItems();
  populateItemSuggestions();
  initializeSortableColumns();
  initializeAddNewItem();
  initializeItemModalCategories(() => items);
}

searchInputElement.addEventListener("input", () => {
  currentPage = 1;
  renderItems();
});

sortOrderElement.addEventListener("change", () => {
  currentPage = 1;
  const [mode, direction] = sortOrderElement.value.split("_");

  sortMode = mode;
  sortDirection = direction;

  if (sortMode === SORT_MODES.ALPHABETICAL) {
    sortColumn = SORT_COLUMNS.NAME;
  }

  renderItems();
});

itemsPerPageElement.addEventListener("change", () => {
  itemsPerPage = parseInt(itemsPerPageElement.value, 10);
  currentPage = 1;
  renderItems();
});

const itemModalConfirmButtonElement = document.getElementById(
  "itemModalConfirmButton",
);
itemModalConfirmButtonElement.addEventListener("click", async () => {
  const itemModalMode = document.getElementById("itemModalMode").value;
  const itemId = document.getElementById("itemId").value;

  const itemName = document.getElementById("itemName").value.trim();
  const itemCategory = document.getElementById("itemCategory").value.trim();
  const itemQuantity = document.getElementById("itemQuantity").value.trim();
  const itemDescription = document
    .getElementById("itemDescription")
    .value.trim();

  if (!itemName || !itemCategory || !itemQuantity) {
    alert("Please fill in all required fields.");
    return;
  }

  const isEditMode = itemModalMode === "edit";

  try {
    const response = await fetch(
      isEditMode
        ? API_URL + `/item-management/items/${itemId}`
        : API_URL + "/item-management/items",
      {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: itemName,
          category: itemCategory,
          quantity: itemQuantity,
          description: itemDescription,
        }),
      },
    );
    const data = await response.json();
    if (!response.ok) {
      if (data.errors && data.errors.length > 0) {
        alert(data.errors.join("\n"));
      }
      console.error("Failed to save item:", data);
      return;
    }
    console.log("Item saved successfully:", data);
    items[data.id] = data;

    alert("Item saved successfully!");
  } catch (error) {
    console.error(error);
  }

  // Reset the form
  document.getElementById("itemForm").reset();
  const itemCategoryElement = document.getElementById("itemCategory");
  itemCategoryElement.value = ""; // Reset to default option
  document.getElementById("itemId").value = "";

  renderItems();
  populateItemSuggestions();

  const itemModalElement = document.getElementById("itemModal");
  const itemModal = Modal.getInstance(itemModalElement);
  itemModal.hide();
});

async function fetchItems() {
  try {
    const response = await fetch(API_URL + "/item-management/items");

    const data = await response.json();
    if (!response.ok) {
      if (data.errors && data.errors.length > 0) {
        alert(data.errors.join("\n"));
      }
      console.error("Failed to items", data);
      return;
    }
    data.forEach((item) => {
      items[item.id] = item;
    });
  } catch (error) {
    console.error("Error fetching items:", error);
  }
}

function initializeSortableColumns() {
  const reverseDirection = (sortDirection) => {
    const newSortDirection =
      sortDirection === SORT_DIRECTIONS.ASCENDING
        ? SORT_DIRECTIONS.DESCENDING
        : SORT_DIRECTIONS.ASCENDING;
    return newSortDirection;
  };

  const sortableColumns = document.querySelectorAll(".sortable-column");
  sortableColumns.forEach((column) => {
    column.addEventListener("click", () => {
      if (sortMode !== SORT_MODES.ALPHABETICAL) {
        sortMode = SORT_MODES.ALPHABETICAL;
      }
      const newSortColumn = column.textContent.toLowerCase();
      if (sortColumn === newSortColumn) {
        sortDirection = reverseDirection(sortDirection);
      } else {
        sortColumn = newSortColumn;
        sortDirection = SORT_DIRECTIONS.ASCENDING;
      }
      currentPage = 1;
      const sortOrderValue = `${sortMode}_${sortDirection}`;
      sortOrderElement.value = sortOrderValue; // Update the select element value -> updates the filter dropdown
      renderItems();
    });
  });
}

function addItemToTable(item, paginatedItemsLength) {
  const itemRow = itemTemplateElement.content.cloneNode(true);
  itemRow.querySelector(".item-name").textContent = item.name;
  itemRow.querySelector(".item-id").textContent = item.id;
  itemRow.querySelector(".item-category").textContent = item.category;
  itemRow.querySelector(".item-quantity").textContent = item.quantity;
  const itemDescriptionElement = itemRow.querySelector(".item-description");
  itemDescriptionElement.textContent = item.description;
  itemDescriptionElement.title = item.description;

  itemRow.querySelector(".edit-button").addEventListener("click", () => {
    initializeEditItem(item);
  });
  itemRow.querySelector(".remove-button").addEventListener("click", () => {
    removeItem(item.id);
  });

  // Quite an annoying hack to prevent the dropdown from being cut off when there are almost no items
  const dropdown = itemRow.getElementById("actionMenuButton");
  if (paginatedItemsLength < 3) {
    dropdown.addEventListener("show.bs.dropdown", () => {
      document.querySelector(".table-responsive").style.overflow = "visible";
    });
    dropdown.addEventListener("hide.bs.dropdown", () => {
      document.querySelector(".table-responsive").style.overflow = "auto";
    });
  }

  itemTableBodyElement.appendChild(itemRow);
}

function renderItems() {
  itemTableBodyElement.innerHTML = "";
  const filteredItems = filterItems();
  const paginatedItems = paginateList(filteredItems, currentPage, itemsPerPage);

  Object.values(paginatedItems).forEach((item) => {
    console.log(item);
    addItemToTable(item, paginatedItems.length);
  });
  renderPaginationControls(
    filteredItems,
    currentPage,
    itemsPerPage,
    paginationControlsElement,
    (page) => {
      currentPage = page;
      renderItems();
    },
  );

  const sortableColumns = document.querySelectorAll(".sortable-column");
  sortableColumns.forEach((column) => {
    column.classList.remove("sorted-ascending", "sorted-descending");
    if (
      column.textContent.toLowerCase() === sortColumn &&
      sortMode === SORT_MODES.ALPHABETICAL
    ) {
      column.classList.add(
        sortDirection === SORT_DIRECTIONS.ASCENDING
          ? "sorted-ascending"
          : "sorted-descending",
      );
    }
  });
}

async function removeItem(id) {
  if (!confirm("Are you sure you want to remove this item?")) {
    return; // User canceled the deletion
  }
  try {
    const response = await fetch(API_URL + `/item-management/items/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (!response.ok) {
      if (data.errors && data.errors.length > 0) {
        alert(data.errors.join("\n"));
      }
      console.error("Failed to remove item:", data);
      return;
    }

    data.forEach((removedId) => {
      delete items[removedId];
    });

    const totalPages = Math.ceil(Object.keys(items).length / itemsPerPage);
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    renderItems();
    populateItemSuggestions();
  } catch (error) {
    console.error("Error removing item:", error);
    alert("Failed to remove item. Please try again.");
  }
}

function populateItemSuggestions() {
  itemSuggestionsElement.innerHTML = "";
  Object.values(items).forEach((item) => {
    const option = document.createElement("option");
    option.value = item.name;
    option.textContent = item.name;
    itemSuggestionsElement.appendChild(option);
  });
}

function filterItems() {
  const searchInput = searchInputElement.value.toLowerCase();

  const filteredItems = Object.values(items).filter((item) =>
    item.name.toLowerCase().includes(searchInput),
  );

  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
  });

  switch (sortMode) {
    case SORT_MODES.ALPHABETICAL:
      filteredItems.sort((a, b) =>
        sortDirection === SORT_DIRECTIONS.ASCENDING
          ? collator.compare(a[sortColumn], b[sortColumn])
          : collator.compare(b[sortColumn], a[sortColumn]),
      );
      break;
    case SORT_MODES.DATE:
      filteredItems.sort((a, b) =>
        sortDirection === SORT_DIRECTIONS.ASCENDING ? a.id - b.id : b.id - a.id,
      );
      break;
  }

  return filteredItems;
}
