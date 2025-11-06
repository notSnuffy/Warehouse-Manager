import { DEFAULT_SHAPES } from "@scenes/ShapeEditor";

/**
 * Class representing the user interface for the top-down view data list.
 * @class TopDownViewDataListUserInterface
 */
class TopDownViewDataListUserInterface {
  /**
   * The input HTML element.
   * @type {HTMLElement}
   */
  #inputElement;

  /**
   * The data list HTML element.
   * @type {HTMLElement}
   */
  #dataListElement;

  /**
   * Map to store shape IDs by name.
   * @type {Map<string, string>}
   */
  #shapeIdMap = new Map();

  /**
   * Creates an instance of TopDownViewDataListUserInterface.
   * @param {string} inputId - The ID of the input element.
   * @param {string} dataListId - The ID of the data list element.
   */
  constructor(inputId, dataListId) {
    this.#inputElement = document.getElementById(inputId);
    this.#dataListElement = document.getElementById(dataListId);
  }

  /**
   * Adds a shape to the top-down view data list
   * @param {string} name - The name of the shape
   * @param {string} id - The ID of the shape
   */
  addItem(name, id) {
    const option = document.createElement("option");

    option.value = name;
    this.#shapeIdMap.set(name, id);
    this.#dataListElement.appendChild(option);
  }

  /**
   * Populates the data list from a shape list element
   * @param {string} shapeListElementId - The ID of the shape list element
   */
  populateFromShapeList(shapeListElementId) {
    const shapeListElement = document.getElementById(shapeListElementId);
    const buttons = shapeListElement.querySelectorAll("button");
    buttons.forEach((button) => {
      let shapeName = button.dataset.shape_name;

      if (!shapeName) {
        return;
      }

      if (DEFAULT_SHAPES.includes(shapeName)) {
        if (shapeName === "polygon" || shapeName === "arc") {
          // Skip polygon and arc shapes as they have to be defined by the user
          return;
        }

        shapeName = shapeName.charAt(0).toUpperCase() + shapeName.slice(1);
      }

      const shapeId = button.dataset.id;
      if (!shapeId) {
        return;
      }

      this.addItem(shapeName, shapeId);
    });
  }

  /**
   * Gets the shape ID by its name
   * @param {string} name - The name of the shape
   * @return {string|undefined} The ID of the shape or undefined if not found
   */
  getShapeIdByName(name) {
    return this.#shapeIdMap.get(name);
  }

  /**
   * Gets the currently selected item name
   * @return {string} The selected item name
   */
  getSelectedItemName() {
    return this.#inputElement.value;
  }
}

export default TopDownViewDataListUserInterface;
