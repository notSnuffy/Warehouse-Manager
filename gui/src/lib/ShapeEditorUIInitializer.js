import { Modal } from "bootstrap";

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
   * If the UI has been initialized
   * @type {boolean}
   * @private
   * @default false
   * @static
   */
  static #initialized = false;
  /**
   * Initializes the UI
   * @param {Function} addShape - Function to add a shape
   * @param {string[]} shapes - Array of shapes
   * @static
   */
  static initialize(addShape, shapes) {
    if (ShapeEditorUIInitializer.#initialized) {
      return;
    }

    ShapeEditorUIInitializer.#initialized = true;
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
  }
}

export default ShapeEditorUIInitializer;
