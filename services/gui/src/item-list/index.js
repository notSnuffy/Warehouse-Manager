import "./styles.scss";
import * as _bootstrap from "bootstrap";
import { API_URL } from "../config";

const itemTableBodyElement = document.getElementById("itemTableBody");
const itemTemplateElement = document.getElementById("itemTemplate");
const searchInputElement = document.getElementById("searchInput");
const itemsPerPageElement = document.getElementById("itemsPerPage");
const sortOrderElement = document.getElementById("sortOrder");
const addItemButtonElement = document.getElementById("addItemButton");
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
  renderItems();
  populateItemSuggestions();
  initializeSortableColumns();
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

addItemButtonElement.addEventListener("click", () => {
  window.location.href = "/";
});

async function _fetchItems() {
  try {
    const response = await fetch(API_URL + "/item-management/items");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
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

function paginateItems(items) {
  const totalItems = items.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  return items.slice(startIndex, endIndex);
}

function renderItems() {
  itemTableBodyElement.innerHTML = "";
  const filteredItems = filterItems();
  const paginatedItems = paginateItems(filteredItems);

  Object.values(paginatedItems).forEach((item) => {
    const itemRow = itemTemplateElement.content.cloneNode(true);
    itemRow.querySelector(".item-name").textContent = item.name;
    itemRow.querySelector(".item-id").textContent = item.id;
    itemRow.querySelector(".item-category").textContent = item.category;
    itemRow.querySelector(".item-quantity").textContent = item.quantity;
    const itemDescriptionElement = itemRow.querySelector(".item-description");
    itemDescriptionElement.textContent = item.description;
    itemDescriptionElement.title = item.description;

    itemRow.querySelector(".edit-button").addEventListener("click", () => {
      editItem(item.id);
    });
    itemRow.querySelector(".remove-button").addEventListener("click", () => {
      removeItem(item.id);
    });

    // Quite an annoying hack to prevent the dropdown from being cut off when there are almost no items
    const dropdown = itemRow.getElementById("actionMenuButton");
    if (paginatedItems.length < 3) {
      dropdown.addEventListener("show.bs.dropdown", () => {
        document.querySelector(".table-responsive").style.overflow = "visible";
      });
      dropdown.addEventListener("hide.bs.dropdown", () => {
        document.querySelector(".table-responsive").style.overflow = "auto";
      });
    }

    itemTableBodyElement.appendChild(itemRow);
  });
  renderPaginationControls(filteredItems);

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

function renderPaginationControls(items) {
  const totalPages = Math.ceil(items.length / itemsPerPage);
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
        renderItems();
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

function editItem(id) {
  window.location.href = `/?id=${id}`;
}

async function removeItem(id) {
  if (!confirm("Are you sure you want to remove this item?")) {
    return; // User canceled the deletion
  }
  try {
    //const response = await fetch(API_URL + `/item-management/items/${id}`, {
    //  method: "DELETE",
    //});
    //if (!response.ok) {
    //  throw new Error("Network response was not ok");
    //}
    // Remove the item from the list
    //}
    delete items[id]; // Remove the item from the items object

    const totalPages = Math.ceil(Object.keys(items).length / itemsPerPage);
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    renderItems();
    populateItemSuggestions();
  } catch (error) {
    console.error("Error removing item:", error);
  }
}

function populateItemSuggestions() {
  itemSuggestionsElement.innerHTML = "";
  Object.values(items).forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
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
