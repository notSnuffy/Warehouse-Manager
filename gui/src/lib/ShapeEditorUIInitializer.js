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
        const width = document.getElementById("shapeWidth").value;
        const height = document.getElementById("shapeHeight").value;
        const x = document.getElementById("shapeX").value + width / 2;
        const y = document.getElementById("shapeY").value + height / 2;
        const color = document.getElementById("shapeColor").value;

        addShape(shapeType, {
          x: parseInt(x),
          y: parseInt(y),
          width: parseInt(width),
          height: parseInt(height),
          color: parseInt(color.slice(1), 16),
        });

        const modalElement = document.getElementById("newShapeModal");
        const modal = Modal.getInstance(modalElement);
        modal.hide();
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
