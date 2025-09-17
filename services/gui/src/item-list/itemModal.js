import { Modal } from "bootstrap";

/**
 * Initializes button for showing the category input field
 */
function initializeShowCategoryInput() {
  const showCategoryInputElement = document.getElementById("showCategoryInput");
  showCategoryInputElement.addEventListener("click", () => {
    const newCategoryGroupElement = document.getElementById("newCategoryGroup");
    newCategoryGroupElement.classList.remove("d-none");
    newCategoryGroupElement.focus();

    const newCategoryNameElement = document.getElementById("newCategoryName");
    newCategoryNameElement.value = "";
  });
}

/**
 * Initializes the "Add Category" button functionality.
 * @param {Set<string>} categories - Set of existing categories.
 * @returns {void}
 */
function initializeAddCategoryButton(categories) {
  const addCategoryButtonElement = document.getElementById("addCategoryButton");
  addCategoryButtonElement.addEventListener("click", () => {
    const newCategoryNameElement = document.getElementById("newCategoryName");
    const categoryName = newCategoryNameElement.value.trim();

    if (!categoryName || categories.has(categoryName)) {
      alert("Please enter a valid category name that does not already exist.");
      return;
    }

    categories.add(categoryName);
    addNewCategory(categoryName);
    newCategoryNameElement.value = "";

    const newCategoryGroupElement = document.getElementById("newCategoryGroup");
    newCategoryGroupElement.classList.add("d-none");
  });
}

/**
 * Initializes the "Cancel" button for adding new category.
 * @returns {void}
 */
function initializeCancelCategoryButton() {
  const cancelCategoryButtonElement = document.getElementById(
    "cancelCategoryButton",
  );
  cancelCategoryButtonElement.addEventListener("click", () => {
    const newCategoryGroupElement = document.getElementById("newCategoryGroup");
    newCategoryGroupElement.classList.add("d-none");
    document.getElementById("newCategoryName").value = "";
  });
}

/**
 * Adds a new category option to the item category dropdown.
 * @param {string} categoryName - The name of the new category.
 * @returns {void}
 */
function addNewCategory(categoryName) {
  const itemCategoryElement = document.getElementById("itemCategory");
  const newOption = document.createElement("option");
  newOption.value = categoryName;
  newOption.textContent = categoryName;

  itemCategoryElement.appendChild(newOption);
  itemCategoryElement.value = categoryName;
}

/**
 * Populates the item category dropdown with existing categories.
 * @param {Set<string>} categories - Set of existing categories.
 * @returns {void}
 */
function populateCategorySelector(categories) {
  const itemCategoryElement = document.getElementById("itemCategory");
  itemCategoryElement.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select a category";
  defaultOption.disabled = true;
  itemCategoryElement.appendChild(defaultOption);

  categories.forEach((category) => {
    addNewCategory(category);
  });
  defaultOption.selected = true;
}

/**
 * Sets up the item modal for adding or editing an item.
 * @param {Object|null} item - The item to edit, or null for adding a new item.
 * @returns {Modal} - The initialized Bootstrap Modal instance.
 */
function setupItemModal(item = null) {
  const itemModalElement = document.getElementById("itemModal");
  const modalTitleElement = document.getElementById("itemModalTitle");
  const confirmButtonElement = document.getElementById(
    "itemModalConfirmButton",
  );

  const itemFormElement = document.getElementById("itemForm");
  itemFormElement.reset();
  document.getElementById("itemCategory").value = "";

  const itemModalModeElement = document.getElementById("itemModalMode");
  const itemIdElement = document.getElementById("itemId");

  if (item) {
    modalTitleElement.textContent = "Edit Item";
    confirmButtonElement.textContent = "Save Changes";

    itemModalModeElement.value = "edit";
    itemIdElement.value = item.id;

    document.getElementById("itemName").value = item.name;
    document.getElementById("itemCategory").value = item.category;
    document.getElementById("itemQuantity").value = item.quantity;
    document.getElementById("itemDescription").value = item.description;
  } else {
    modalTitleElement.textContent = "Add New Item";
    confirmButtonElement.textContent = "Confirm";

    itemModalModeElement.value = "add";
    itemIdElement.value = "";
  }

  return new Modal(itemModalElement);
}

/**
 * Initializes the "Add New Item" functionality.
 * @returns {void}
 */
function initializeAddNewItem() {
  const addItemButtonElement = document.getElementById("addItemButton");

  addItemButtonElement.addEventListener("click", () => {
    const modal = setupItemModal();
    modal.show();
  });
}

/**
 * Initializes the "Edit Item" functionality.
 * @param {Object} item - The item to edit.
 * @returns {void}
 */
function initializeEditItem(item) {
  const modal = setupItemModal(item);
  modal.show();
}

/**
 * Initializes item modal categories, including event listeners and populating existing categories.
 * @param {Function} getItems - Function to retrieve the current items.
 * @returns {void}
 */
function initializeItemModalCategories(getItems) {
  const itemCategoryElement = document.getElementById("itemCategory");
  itemCategoryElement.addEventListener("change", (event) => {
    const selectedCategory = event.target.value;
    const newCategoryGroupElement = document.getElementById("newCategoryGroup");
    if (selectedCategory) {
      newCategoryGroupElement.classList.add("d-none");
    }
  });

  initializeShowCategoryInput();

  const categories = new Set(
    Object.values(getItems()).map((item) => item.category),
  );
  populateCategorySelector(categories);
  initializeAddCategoryButton(categories);
  initializeCancelCategoryButton();
}

export {
  initializeAddNewItem,
  initializeEditItem,
  initializeItemModalCategories,
};
