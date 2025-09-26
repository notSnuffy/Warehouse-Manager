import { Modal } from "bootstrap";
import Sortable from "sortablejs";
import { API_URL } from "../../config";
import { DEFAULT_SHAPES } from "../../scenes/ShapeEditor";
import { ShapeTypes } from "../functions/shapes";

/**
 * Displays a modal for adding a new shape.
 * @param {HTMLElement} button - The button that triggered the modal.
 * @returns {void}
 */
function showAddShapeModal(button) {
  const shapeId = button.dataset.id;
  const shapeName = button.dataset.shape_name;
  const modalElement = document.getElementById("newShapeModal");
  const shapeIdElement = document.getElementById("shapeId");
  const modalTitle = document.getElementById("newShapeModalLabel");

  modalTitle.textContent =
    "Add New " + shapeName.charAt(0).toUpperCase() + shapeName.slice(1);
  shapeIdElement.value = shapeId;

  const radiusGroup = document.getElementById("radiusGroup");
  const angleGroup = document.getElementById("angleGroup");
  const widthGroup = document.getElementById("widthGroup");
  const heightGroup = document.getElementById("heightGroup");
  const polygonGroup = document.getElementById("polygonGroup");

  const polygonPoints = document.getElementById("polygonPoints");
  polygonPoints.innerHTML = "";

  // Having the 0, 0 point as read-only should prevent the hitbox being broken
  const defaultPoints = [
    { x: 0, y: 0, readOnly: true },
    { x: 50, y: 0, readOnly: false },
    { x: 50, y: 50, readOnly: false },
  ];

  for (let i = 0; i < 3; ++i) {
    const point = document.createElement("div");
    const pointX = defaultPoints[i].x;
    const pointY = defaultPoints[i].y;
    const readOnly = defaultPoints[i].readOnly;
    point.className = "input-group";
    point.innerHTML = `
      <span class="input-group-text">Point${i} X</span>
      <input
        type="number"
        class="form-control"
        id="shapePoint${i}X"
        required
        value="${pointX}"
        ${readOnly ? "readonly" : ""}
        min="0"
      />
      <span class="input-group-text">Point${i} Y</span>
      <input
        type="number"
        class="form-control"
        id="shapePoint${i}Y"
        required
        value="${pointY}"
        ${readOnly ? "readonly" : ""}
        min="0"
      />
      `;
    polygonPoints.appendChild(point);

    document.getElementById(`shapePoint${i}X`).addEventListener("input", () => {
      if (document.getElementById(`shapePoint${i}X`).value < 0) {
        document.getElementById(`shapePoint${i}X`).value = 0;
      }
    });

    document.getElementById(`shapePoint${i}Y`).addEventListener("input", () => {
      if (document.getElementById(`shapePoint${i}Y`).value < 0) {
        document.getElementById(`shapePoint${i}Y`).value = 0;
      }
    });
  }

  if (shapeId === ShapeTypes.ARC) {
    radiusGroup.hidden = false;
    angleGroup.hidden = false;
    widthGroup.hidden = true;
    heightGroup.hidden = true;
    polygonGroup.hidden = true;
  } else if (shapeId === ShapeTypes.POLYGON) {
    radiusGroup.hidden = true;
    angleGroup.hidden = true;
    widthGroup.hidden = true;
    heightGroup.hidden = true;
    polygonGroup.hidden = false;
  } else if (
    shapeId === ShapeTypes.RECTANGLE ||
    shapeId === ShapeTypes.ELLIPSE
  ) {
    radiusGroup.hidden = true;
    angleGroup.hidden = true;
    widthGroup.hidden = false;
    heightGroup.hidden = false;
    polygonGroup.hidden = true;
  } else {
    radiusGroup.hidden = true;
    angleGroup.hidden = true;
    widthGroup.hidden = true;
    heightGroup.hidden = true;
    polygonGroup.hidden = true;
  }

  const modal = new Modal(modalElement);
  modal.show();
}

/**
 * Adds a button handler
 * @param {string} id - Id of the button
 * @param {string} eventType - Event type
 * @param {Function} eventHandler - Event handler
 */
function addButtonHandler(id, eventType, eventHandler) {
  let button = document.getElementById(id);
  button.addEventListener(eventType, eventHandler);
}

function addValidationHandlersToAddShapeModal() {
  const validateShapeWidth = function () {
    const shapeWidthInput = document.getElementById("shapeWidth");
    const shapeWidth = parseInt(shapeWidthInput.value, 10);
    console.log("Validating shape width:", shapeWidth);

    if (shapeWidth < 10 || isNaN(shapeWidth)) {
      shapeWidthInput.value = 10;
    }
  };
  document
    .getElementById("shapeWidth")
    .addEventListener("change", validateShapeWidth);

  const validateShapeHeight = function () {
    const shapeHeightInput = document.getElementById("shapeHeight");
    const shapeHeight = parseInt(shapeHeightInput.value, 10);

    if (shapeHeight < 10 || isNaN(shapeHeight)) {
      shapeHeightInput.value = 10;
    }
  };
  document
    .getElementById("shapeHeight")
    .addEventListener("change", validateShapeHeight);

  const validateShapeRadius = function () {
    const shapeRadiusInput = document.getElementById("shapeRadius");
    const shapeRadius = parseInt(shapeRadiusInput.value, 10);

    if (shapeRadius < 5 || isNaN(shapeRadius)) {
      shapeRadiusInput.value = 5;
    }
  };
  document
    .getElementById("shapeRadius")
    .addEventListener("change", validateShapeRadius);

  const validateShapeAngle = function () {
    const shapeAngleInput = document.getElementById("shapeAngle");
    const shapeAngle = parseInt(shapeAngleInput.value, 10);

    if (shapeAngle < 0 || isNaN(shapeAngle)) {
      shapeAngleInput.value = 0;
    }
    if (shapeAngle > 360 || isNaN(shapeAngle)) {
      shapeAngleInput.value = 360;
    }
  };
  document
    .getElementById("shapeAngle")
    .addEventListener("change", validateShapeAngle);
}

/**
 * Adds a confirmation button handler to the add shape modal.
 * @param {Function} addShape - Function to call when the confirmation button is clicked.
 * @returns {void}
 */
function addShapeConfirmationButtonHandler(addShape) {
  document
    .getElementById("addShapeConfirmButton")
    .addEventListener("click", function () {
      const shapeId = document.getElementById("shapeId").value;

      let x = parseInt(document.getElementById("shapeX").value, 10);
      let y = parseInt(document.getElementById("shapeY").value, 10);

      if (shapeId === ShapeTypes.ARC) {
        const radius = parseInt(
          document.getElementById("shapeRadius").value,
          10,
        );
        const angle = document.getElementById("shapeAngle").value;
        x += radius;
        y += radius;
        const color = document.getElementById("shapeColor").value;

        addShape(shapeId, {
          x: x,
          y: y,
          radius: radius,
          angle: parseInt(angle, 10),
          color: parseInt(color.slice(1), 16),
        });
      } else if (shapeId === ShapeTypes.POLYGON) {
        const points = [];
        const polygonPoints = document.getElementById("polygonPoints");

        for (let i = 0; i < polygonPoints.children.length; ++i) {
          const pointX = document.getElementById(`shapePoint${i}X`).value;
          const pointY = document.getElementById(`shapePoint${i}Y`).value;
          points.push(parseInt(pointX, 10));
          points.push(parseInt(pointY, 10));
        }

        const color = document.getElementById("shapeColor").value;

        addShape(shapeId, {
          x: x,
          y: y,
          points: points,
          color: parseInt(color.slice(1), 16),
        });
      } else if (
        shapeId === ShapeTypes.RECTANGLE ||
        shapeId === ShapeTypes.ELLIPSE
      ) {
        const width = document.getElementById("shapeWidth").value;
        const height = document.getElementById("shapeHeight").value;
        x += width / 2;
        y += height / 2;
        const color = document.getElementById("shapeColor").value;

        addShape(shapeId, {
          x: x,
          y: y,
          width: parseInt(width, 10),
          height: parseInt(height, 10),
          color: parseInt(color.slice(1), 16),
        });
      } else {
        const color = document.getElementById("shapeColor").value;

        addShape(shapeId, {
          x: x,
          y: y,
          color: parseInt(color.slice(1), 16),
        });
      }

      const modalElement = document.getElementById("newShapeModal");
      const modal = Modal.getInstance(modalElement);
      modal.hide();
    });
}

/**
 * Adds a handler to add polygon points in the add shape modal.
 * @returns {void}
 */
function addHandlerToAddPolygonPoints() {
  const addPolygonPointButton = document.getElementById(
    "addPolygonPointButton",
  );
  addPolygonPointButton.addEventListener("click", function () {
    const polygonPoints = document.getElementById("polygonPoints");

    const pointIndex = polygonPoints.children.length;

    const point = document.createElement("div");
    point.className = "input-group";
    point.innerHTML = `
      <span class="input-group-text">Point${pointIndex} X</span>
      <input
        type="number"
        class="form-control"
        id="shapePoint${pointIndex}X"
        required
        value="0"
      />
      <span class="input-group-text">Point${pointIndex} Y</span>
      <input
        type="number"
        class="form-control"
        id="shapePoint${pointIndex}Y"
        required
        value="0"
      />
      `;
    polygonPoints.appendChild(point);

    document
      .getElementById(`shapePoint${pointIndex}X`)
      .addEventListener("input", () => {
        if (document.getElementById(`shapePoint${pointIndex}X`).value < 0) {
          document.getElementById(`shapePoint${pointIndex}X`).value = 0;
        }
      });

    document
      .getElementById(`shapePoint${pointIndex}Y`)
      .addEventListener("input", () => {
        if (document.getElementById(`shapePoint${pointIndex}Y`).value < 0) {
          document.getElementById(`shapePoint${pointIndex}Y`).value = 0;
        }
      });
  });
}

/**
 * Adds a handler to remove polygon points in the add shape modal.
 * @returns {void}
 */
function addHandlerToRemovePolygonPoints() {
  const removePolygonPointButton = document.getElementById(
    "removePolygonPointButton",
  );
  removePolygonPointButton.addEventListener("click", function () {
    const polygonPoints = document.getElementById("polygonPoints");
    const pointIndex = polygonPoints.children.length - 1;

    if (pointIndex > 2) {
      polygonPoints.removeChild(polygonPoints.children[pointIndex]);
    }
  });
}

/**
 * Adds handlers to add and remove polygon points in the add shape modal.
 * @returns {void}
 */
function addPolygonPointHandlers() {
  addHandlerToAddPolygonPoints();
  addHandlerToRemovePolygonPoints();
}

/**
 * Initializes the add shape modal.
 * @param {Function} addShape - Function to call when the modal is confirmed.
 * @returns {void}
 */
function initializeAddShapeModal(addShape) {
  addValidationHandlersToAddShapeModal();
  addShapeConfirmationButtonHandler(addShape);
  addPolygonPointHandlers();
}

/**
 * Adds a new shape button into the list of available shapes.
 * @param {string} shapeName - The name of the shape.
 * @param {string} shapeId - The ID of the shape.
 * @returns {void}
 */
function addItemButtonIntoList(shapeName, shapeId) {
  const newShapeButton = document.createElement("button");
  newShapeButton.classList.add("btn", "btn-secondary", "mb-2");
  newShapeButton.dataset.shape_name = shapeName;
  newShapeButton.dataset.id = shapeId;
  newShapeButton.textContent = shapeName;
  newShapeButton.id = "add-" + shapeId;
  newShapeButton.addEventListener("click", function () {
    showAddShapeModal(newShapeButton);
  });
  const itemsMenuButtons = document.getElementById("itemsMenuButtons");
  itemsMenuButtons.appendChild(newShapeButton);
}

/**
 * Populates the shape list with available shapes from the API.
 * @returns {Promise<void>}
 */
async function populateShapeList() {
  const getDefaultShapeId = (shape) => {
    switch (shape) {
      case "rectangle":
        return ShapeTypes.RECTANGLE;
      case "ellipse":
        return ShapeTypes.ELLIPSE;
      case "arc":
        return ShapeTypes.ARC;
      case "polygon":
        return ShapeTypes.POLYGON;
      default:
        return null;
    }
  };

  for (const shape of DEFAULT_SHAPES) {
    const shapeId = getDefaultShapeId(shape);
    const button = document.getElementById("add-" + shapeId);
    button.addEventListener("click", function () {
      showAddShapeModal(button);
    });
  }

  try {
    const response = await fetch(API_URL + "/shape-management/shapes");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Splice system shapes from the data
    data.splice(0, DEFAULT_SHAPES.length);
    data.forEach((shape) => {
      addItemButtonIntoList(shape.name, shape.id);
    });
  } catch (error) {
    console.error("Error fetching shapes:", error);
  }
}

/**
 * Adds a confirmation button handler to the add furniture modal.
 * @param {Function} addFurniture - Function to call when the confirmation button is clicked.
 * @returns {void}
 */
function addFurnitureConfirmationButtonHandler(addFurniture) {
  document
    .getElementById("addFurnitureConfirmButton")
    .addEventListener("click", function () {
      const furnitureId = document.getElementById("furnitureId").value;
      const name = document.getElementById("furnitureName").value;

      let x = parseInt(document.getElementById("furnitureX").value, 10);
      let y = parseInt(document.getElementById("furnitureY").value, 10);

      const width = document.getElementById("furnitureWidth").value;
      const height = document.getElementById("furnitureHeight").value;
      x += width / 2;
      y += height / 2;
      const color = document.getElementById("furnitureColor").value;
      const textColor = document.getElementById("furnitureTextColor").value;

      addFurniture({
        x: x,
        y: y,
        width: parseInt(width, 10),
        height: parseInt(height, 10),
        color: parseInt(color.slice(1), 16),
        textColor: textColor,
        id: furnitureId,
        name: name,
      });

      const modalElement = document.getElementById("newFurnitureModal");
      const modal = Modal.getInstance(modalElement);
      modal.hide();
    });
}

/**
 * Initializes the add furniture modal.
 * @param {Function} addFurniture - Function to call when the modal is confirmed.
 * @returns {void}
 */
function initializeAddFurnitureModal(addFurniture) {
  addFurnitureConfirmationButtonHandler(addFurniture);
}

function showAddFurnitureModal(button) {
  const furniture = button.dataset.furniture;
  const modalElement = document.getElementById("newFurnitureModal");
  const modalTitle = document.getElementById("newFurnitureModalLabel");
  const furnitureIdElement = document.getElementById("furnitureId");
  const furnitureId = button.dataset.id;
  furnitureIdElement.value = furnitureId;
  const furnitureNameElement = document.getElementById("furnitureName");
  furnitureNameElement.value = furniture;

  modalTitle.textContent =
    "Add New " + furniture.charAt(0).toUpperCase() + furniture.slice(1);

  const modal = new Modal(modalElement);
  modal.show();
}

/**
 * Adds a new furniture button into the list of available furniture.
 * @param {string} furnitureName - The name of the furniture.
 * @param {string} furnitureId - The ID of the furniture.
 * @returns {void}
 */
function addFurnitureButtonIntoList(furnitureName, furnitureId) {
  const newFurnitureButton = document.createElement("button");
  newFurnitureButton.classList.add("btn", "btn-secondary", "mb-2");
  newFurnitureButton.dataset.furniture = furnitureName;
  newFurnitureButton.dataset.id = furnitureId;
  newFurnitureButton.textContent = furnitureName;
  newFurnitureButton.id = "add-" + furnitureId;
  newFurnitureButton.addEventListener("click", function () {
    showAddFurnitureModal(newFurnitureButton);
  });
  const furnitureMenuButtons = document.getElementById("furnitureMenuButtons");
  furnitureMenuButtons.appendChild(newFurnitureButton);
}

/**
 * Populates the furniture list with available furniture from the API.
 * @returns {Promise<void>}
 */
async function populateFurnitureList() {
  try {
    const response = await fetch(API_URL + "/furniture-management/furniture");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    data.forEach((furniture) => {
      addFurnitureButtonIntoList(furniture.name, furniture.id);
    });
  } catch (error) {
    console.error("Error fetching furniture:", error);
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
  addButtonHandler,
  initializeAddShapeModal,
  populateShapeList,
  populateFurnitureList,
  populateFloorViewItemList,
  initializeAddFurnitureModal,
  addItemButtonIntoList,
};
