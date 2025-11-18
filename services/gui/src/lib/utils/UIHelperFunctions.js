import Sortable from "sortablejs";
import { API_URL } from "@/config";

/**
 * Adds a handler to add point fields.
 * @param {HTMLElement} element - The element to which the handler is added.
 * @param {HTMLElement} pointsElement - The element containing the points.
 * @param {string} name - The base name for the point fields.
 * @returns {void}
 */
function addPointFieldHandler(element, pointsElement, name) {
  element.addEventListener("click", function () {
    const pointIndex = pointsElement.children.length;

    const point = document.createElement("div");
    point.className = "input-group";
    point.innerHTML = `
      <span class="input-group-text">Point${pointIndex} X</span>
      <input
        type="number"
        class="form-control"
        id="${name}${pointIndex}X"
        name="pointX[]" 
        required
        value="0"
      />
      <span class="input-group-text">Point${pointIndex} Y</span>
      <input
        type="number"
        class="form-control"
        id="${name}${pointIndex}Y"
        name="pointY[]"
        required
        value="0"
      />
      `;
    pointsElement.appendChild(point);

    point
      .querySelector(`#${name}${pointIndex}X`)
      .addEventListener("change", validatePosition);

    point
      .querySelector(`#${name}${pointIndex}Y`)
      .addEventListener("change", validatePosition);
  });
}

/**
 * Adds a handler to remove point fields.
 * @param {HTMLElement} element - The element to which the handler is added.
 * @param {HTMLElement} pointsElement - The element containing the points.
 * @returns {void}
 */
function removePointFieldHandler(element, pointsElement) {
  element.addEventListener("click", function () {
    const pointIndex = pointsElement.children.length - 1;

    if (pointIndex > 2) {
      pointsElement.removeChild(pointsElement.children[pointIndex]);
    }
  });
}

/**
 * Creates an input field based on the provided field definition.
 * @param {Object} field - The field definition.
 * @param {string} field.name - The name of the field.
 * @param {string} field.label - The label for the field.
 * @param {string} field.type - The type of the field (e.g., "text", "number", "color", "points", "group").
 * @param {Object} [field.attributes] - Additional attributes for the input element.
 * @param {Array} [field.classes] - Additional classes for the input element.
 * @param {Object} [field.validation] - Validation configuration for the input element.
 * @param {string} field.validation.event - The event to listen for validation.
 * @param {Function} field.validation.handler - The validation handler function.
 * @returns {HTMLElement} The created input field element.
 */
function createInputField(field) {
  const container = document.createElement("div");
  if (field.type === "group") {
    const group = document.createElement("div");
    group.className = "input-group";
    group.id = field.name + "Group";
    field.fields.forEach((subField) => {
      const subFieldElement = createInputField(subField);
      group.appendChild(subFieldElement);
    });
    return group;
  }

  const labelElement = document.createElement("label");
  labelElement.htmlFor = field.name;
  labelElement.textContent = field.label;
  labelElement.className = "form-label";

  let inputElement;

  if (field.type === "points") {
    inputElement = document.createElement("div");
    inputElement.id = field.name;

    const defaultPoints = [
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 50, y: 50 },
    ];

    for (let i = 0; i < 3; ++i) {
      const point = document.createElement("div");
      const pointX = defaultPoints[i].x;
      const pointY = defaultPoints[i].y;
      point.className = "input-group";
      point.innerHTML = `
      <span class="input-group-text">Point${i} X</span>
      <input
        type="number"
        class="form-control"
        id="${field.name}${i}X"
        required
        value="${pointX}"
        min="0"
        name="pointX[]"
      />
      <span class="input-group-text">Point${i} Y</span>
      <input
        type="number"
        class="form-control"
        id="${field.name}${i}Y"
        required
        value="${pointY}"
        min="0"
        name="pointY[]"
      />
      `;
      inputElement.appendChild(point);

      point
        .querySelector(`#${field.name}${i}X`)
        .addEventListener("change", validatePosition);

      point
        .querySelector(`#${field.name}${i}Y`)
        .addEventListener("change", validatePosition);
    }

    const addPointButton = document.createElement("button");
    addPointButton.type = "button";
    addPointButton.className = "btn btn-primary";
    addPointButton.id = "add" + field.name + "PointButton";
    addPointButton.textContent = "Add Point";
    addPointFieldHandler(addPointButton, inputElement, field.name);

    const removePointButton = document.createElement("button");
    removePointButton.type = "button";
    removePointButton.className = "btn btn-danger";
    removePointButton.id = "remove" + field.name + "PointButton";
    removePointButton.textContent = "Remove Point";
    removePointFieldHandler(removePointButton, inputElement);

    container.appendChild(labelElement);
    container.appendChild(inputElement);
    container.appendChild(addPointButton);
    container.appendChild(removePointButton);
    return container;
  }

  inputElement = document.createElement("input");
  inputElement.type = field.type;
  inputElement.className = "form-control";
  if (field.classes && Array.isArray(field.classes)) {
    field.classes.forEach((cls) => inputElement.classList.add(cls));
  }
  inputElement.id = field.name;
  if (field.attributes) {
    Object.keys(field.attributes).forEach((attr) => {
      inputElement.setAttribute(attr, field.attributes[attr]);
    });
  }

  if (field.validation && Array.isArray(field.validation)) {
    field.validation.forEach((validation) => {
      if (validation.event && validation.handler) {
        inputElement.addEventListener(validation.event, validation.handler);
      }
    });
  }

  container.appendChild(labelElement);
  container.appendChild(inputElement);
  return container;
}

/**
 * Renders dynamic modal fields based on the selected shape type.
 * @param {HTMLElement} fieldsElement - The container element for the fields.
 * @param {Object} fieldSchemas - The field schemas for different shape types.
 * @param {string} shapeType - The selected shape type.
 * @returns {void}
 */
function renderDynamicModalFields(fieldsElement, fieldSchemas, shapeType) {
  fieldsElement.innerHTML = "";

  const fields = fieldSchemas[shapeType] || [];

  fields.forEach((field) => {
    const fieldElement = createInputField(field);
    fieldsElement.appendChild(fieldElement);
  });
}

/**
 * Validates the size input field.
 * @param {Event} event - The change event.
 * @returns {void}
 */
function validateSize(event) {
  const sizeInput = event.target;
  const size = parseInt(sizeInput.value, 10);
  if (size < 10 || isNaN(size)) {
    sizeInput.value = 10;
  }
}

/**
 * Validates the radius input field.
 * @param {Event} event - The change event.
 * @returns {void}
 */
function validateRadius(event) {
  const radiusInput = event.target;
  const radius = parseInt(radiusInput.value, 10);

  if (radius < 5 || isNaN(radius)) {
    radiusInput.value = 5;
  }
}

/**
 * Validates the angle input field.
 * @param {Event} event - The change event.
 * @returns {void}
 */
function validateAngle(event) {
  const angleInput = event.target;
  const angle = parseInt(angleInput.value, 10);
  if (angle < 0 || isNaN(angle)) {
    angleInput.value = 0;
  }
  if (angle > 360) {
    angleInput.value = 360;
  }
}

/**
 * Validates the position input field.
 * @param {Event} event - The change event.
 * @returns {void}
 */
function validatePosition(event) {
  const positionInput = event.target;
  const position = parseInt(positionInput.value, 10);
  if (isNaN(position)) {
    positionInput.value = 0;
  }
}

/**
 * Adds an item into the floor view item list.
 * @param {string} name - The name of the item.
 * @param {string} id - The ID of the item.
 * @returns {void}
 */
function addItemIntoFloorViewItemList(name, id) {
  const itemsMenuItemsElement = document.getElementById("itemsMenuItems");
  const itemElement = document.createElement("li");
  itemElement.textContent = name;
  itemElement.dataset.id = id;
  itemElement.classList.add("list-group-item");

  itemsMenuItemsElement.appendChild(itemElement);
}

/**
 * Populates the floor view item list.
 * @param {Function} setDragged - Function to set if an item is being dragged.
 * @return {Promise<Map>} - A map of items and their changed status.
 */
async function populateFloorViewItemList(setDragged) {
  try {
    const response = await fetch(API_URL + "/item-management/items");
    const data = await response.json();
    if (!response.ok) {
      if (data.errors && data.errors.length > 0) {
        alert(data.errors.join("\n"));
      }
      console.error("Failed to load items:", data);
      return;
    }
    const itemMap = new Map();
    console.log("Items data:", data);
    data.forEach((item) => {
      addItemIntoFloorViewItemList(item.name, item.id);
      let children = new Set();
      item.children.forEach((child) => {
        children.add(child.id);
      });
      itemMap.set(item.id, {
        name: item.name,
        floorId: item.floorId,
        zoneId: item.zoneId,
        parentId: item.parentId,
        changed: false,
        children: children,
      });
    });
    console.log(itemMap);
    const itemsMenuItemsElement = document.getElementById("itemsMenuItems");
    Sortable.create(itemsMenuItemsElement, {
      group: {
        name: "items",
        pull: "clone",
        put: false,
      },
      animation: 150,
      sort: false,
      onStart: function () {
        setDragged(true);
      },
      onEnd: function () {
        setDragged(false);
      },
    });
    return itemMap;
  } catch (error) {
    console.error(error);
  }
}

export {
  populateFloorViewItemList,
  validateSize,
  validateRadius,
  validateAngle,
  validatePosition,
  createInputField,
  renderDynamicModalFields,
};
