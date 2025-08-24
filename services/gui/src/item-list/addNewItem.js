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
  itemCategoryElement.value = "";
}

/**
 * Initializes the "Add New Item" functionality.
 * @param {Function} getItems - Function to retrieve the current items.
 * @returns {void}
 */
function initializeAddNewItem(getItems) {
  const newItemModalElement = document.getElementById("newItemModal");
  const addItemButtonElement = document.getElementById("addItemButton");

  addItemButtonElement.addEventListener("click", () => {
    const modal = new Modal(newItemModalElement);
    modal.show();
  });

  initializeShowCategoryInput();

  const categories = new Set(
    Object.values(getItems()).map((item) => item.category),
  );
  populateCategorySelector(categories);
  initializeAddCategoryButton(categories);
  initializeCancelCategoryButton();
}

export { initializeAddNewItem };
