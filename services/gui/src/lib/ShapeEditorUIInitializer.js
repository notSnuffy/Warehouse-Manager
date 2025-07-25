import { Modal } from "bootstrap";
import { DEFAULT_SHAPES } from "../scenes/ShapeEditor";

/**
 * @class ShapeEditorUIInitializer
 * @classdesc Class that initializes UI for the Shape Editor.
 */
class ShapeEditorUIInitializer {
  static #showModal(button) {
    const shape = button.getAttribute("data-shape");
    const modalElement = document.getElementById("newShapeModal");
    const shapeTypeInput = document.getElementById("shapeType");
    const modalTitle = document.getElementById("newShapeModalLabel");

    modalTitle.textContent =
      "Add New " + shape.charAt(0).toUpperCase() + shape.slice(1);
    shapeTypeInput.value = shape;

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
      />
      <span class="input-group-text">Point${i} Y</span>
      <input
        type="number"
        class="form-control"
        id="shapePoint${i}Y"
        required
        value="${pointY}"
        ${readOnly ? "readonly" : ""}
      />
      `;
      polygonPoints.appendChild(point);

      document
        .getElementById(`shapePoint${i}X`)
        .addEventListener("input", () => {
          if (document.getElementById(`shapePoint${i}X`).value < 0) {
            document.getElementById(`shapePoint${i}X`).value = 0;
          }
        });

      document
        .getElementById(`shapePoint${i}Y`)
        .addEventListener("input", () => {
          if (document.getElementById(`shapePoint${i}Y`).value < 0) {
            document.getElementById(`shapePoint${i}Y`).value = 0;
          }
        });
    }

    if (shape === "arc") {
      radiusGroup.hidden = false;
      angleGroup.hidden = false;
      widthGroup.hidden = true;
      heightGroup.hidden = true;
      polygonGroup.hidden = true;
    } else if (shape === "polygon") {
      radiusGroup.hidden = true;
      angleGroup.hidden = true;
      widthGroup.hidden = true;
      heightGroup.hidden = true;
      polygonGroup.hidden = false;
    } else {
      radiusGroup.hidden = true;
      angleGroup.hidden = true;
      widthGroup.hidden = false;
      heightGroup.hidden = false;
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
   * @private
   */
  static #addButtonHandler(id, eventType, eventHandler) {
    let button = document.getElementById(id);
    button.addEventListener(eventType, eventHandler);
  }

  /**
   * If the UI has been initialized
   * @type {boolean}
   * @private
   * @default false
   * @static
   */
  static #initialized = false;
  /**
   * Initializes the UI
   * @param {Function} handleMoveButtonClick - Function to handle move button click
   * @param {Function} handleSelectButtonClick - Function to handle select button click
   * @param {Function} addShape - Function to add a shape
   * @param {string[]} shapes - Array of shapes
   * @param {Function} saveShape - Function to save a shape
   * @param {Function} selectHide - Function to hide selection
   * @static
   */
  static initialize(
    handleMoveButtonClick,
    handleSelectButtonClick,
    addShape,
    shapes,
    saveShape,
    selectHide,
  ) {
    if (ShapeEditorUIInitializer.#initialized) {
      return;
    }

    ShapeEditorUIInitializer.#initialized = true;

    const menuBar = document.getElementById("menuBar");
    menuBar.hidden = false;
    const itemsMenu = document.getElementById("itemsMenu");
    itemsMenu.hidden = false;

    const validateShapeWidth = function () {
      const shapeWidth = document.getElementById("shapeWidth");

      if (shapeWidth.value < 1) {
        shapeWidth.value = 1;
      }
    };
    document
      .getElementById("shapeWidth")
      .addEventListener("input", validateShapeWidth);

    const validateShapeHeight = function () {
      const shapeHeight = document.getElementById("shapeHeight");

      if (shapeHeight.value < 1) {
        shapeHeight.value = 1;
      }
    };
    document
      .getElementById("shapeHeight")
      .addEventListener("input", validateShapeHeight);

    const validateShapeRadius = function () {
      const shapeRadius = document.getElementById("shapeRadius");

      if (shapeRadius.value < 1) {
        shapeRadius.value = 1;
      }
    };
    document
      .getElementById("shapeRadius")
      .addEventListener("input", validateShapeRadius);

    const validateShapeAngle = function () {
      const shapeAngle = document.getElementById("shapeAngle");

      if (shapeAngle.value < 0) {
        shapeAngle.value = 0;
      } else if (shapeAngle.value > 360) {
        shapeAngle.value = 360;
      }
    };
    document
      .getElementById("shapeAngle")
      .addEventListener("input", validateShapeAngle);

    ShapeEditorUIInitializer.#addButtonHandler(
      "moveButton",
      "click",
      handleMoveButtonClick,
    );
    this.#addButtonHandler("selectButton", "click", handleSelectButtonClick);
    for (const shape of shapes) {
      const button = document.getElementById("add-" + shape);
      button.addEventListener("click", function () {
        ShapeEditorUIInitializer.#showModal(button);
      });
    }

    document
      .getElementById("addShapeConfirmButton")
      .addEventListener("click", function () {
        const shapeType = document.getElementById("shapeType").value;

        let x = parseInt(document.getElementById("shapeX").value);
        let y = parseInt(document.getElementById("shapeY").value);

        if (shapeType === "arc") {
          const radius = parseInt(document.getElementById("shapeRadius").value);
          const angle = document.getElementById("shapeAngle").value;
          x += radius;
          y += radius;
          const color = document.getElementById("shapeColor").value;

          addShape(shapeType, {
            x: x,
            y: y,
            radius: radius,
            angle: parseInt(angle),
            color: parseInt(color.slice(1), 16),
          });
        } else if (shapeType === "polygon") {
          const points = [];
          const polygonPoints = document.getElementById("polygonPoints");

          for (let i = 0; i < polygonPoints.children.length; ++i) {
            const pointX = document.getElementById(`shapePoint${i}X`).value;
            const pointY = document.getElementById(`shapePoint${i}Y`).value;
            points.push(parseInt(pointX));
            points.push(parseInt(pointY));
          }

          const color = document.getElementById("shapeColor").value;

          addShape(shapeType, {
            x: x,
            y: y,
            points: points,
            color: parseInt(color.slice(1), 16),
          });
        } else {
          const width = document.getElementById("shapeWidth").value;
          const height = document.getElementById("shapeHeight").value;
          x += width / 2;
          y = height / 2;
          const color = document.getElementById("shapeColor").value;

          addShape(shapeType, {
            x: x,
            y: y,
            width: parseInt(width),
            height: parseInt(height),
            color: parseInt(color.slice(1), 16),
          });
        }

        const modalElement = document.getElementById("newShapeModal");
        const modal = Modal.getInstance(modalElement);
        modal.hide();
      });

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

    const saveButton = document.getElementById("saveButton");
    saveButton.addEventListener("click", function () {
      selectHide();

      const shapeName = document.getElementById("shapeName").value;
      console.log(shapeName);
      if (shapeName === "") {
        alert("Please enter a shape name");
        return;
      }

      if (DEFAULT_SHAPES.includes(shapeName)) {
        alert("Shape name already exists");
        return;
      }

      saveShape();
    });
  }
}

export default ShapeEditorUIInitializer;
