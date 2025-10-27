import { ShapeTypes } from "@utils/shapes";

/**
 * Class representing the user interface for the shape list.
 * @class ShapeListUserInterface
 */
class ShapeListUserInterface {
  /**
   * The container element for the shape list.
   * @type {HTMLElement}
   */
  #listContainer;

  /**
   * The button click handler function.
   * @type {Function}
   */
  #buttonClickHandler;

  /**
   * The default shapes to be included in the list.
   * @type {Array}
   */
  #defaultShapes;

  /**
   * The URL for shape management API.
   * @type {string}
   */
  #shapeManagementURL;

  /**
   * Creates an instance of ShapeListUserInterface.
   * @param {string} listContainerId - The ID of the container element for the shape list.
   * @param {Function} buttonClickHandler - The function to handle button clicks.
   * @param {Array} defaultShapes - The default shapes to be included in the list.
   * @param {string} shapeManagementURL - The URL for shape management API.
   */
  constructor(
    listContainerId,
    buttonClickHandler,
    defaultShapes = [],
    shapeManagementURL = "",
  ) {
    this.#listContainer = document.getElementById(listContainerId);
    this.#buttonClickHandler = buttonClickHandler;
    this.#defaultShapes = defaultShapes;
    this.#shapeManagementURL = shapeManagementURL;

    this.#initializeShapeList();
  }

  /**
   * Initializes the shape list by adding default shapes and fetching custom shapes.
   * @return {Promise<void>}
   */
  async #initializeShapeList() {
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

    for (const shape of this.#defaultShapes) {
      const shapeId = getDefaultShapeId(shape);
      const button = document.getElementById("add-" + shapeId);
      button.addEventListener(
        "click",
        function () {
          this.#buttonClickHandler(shape, shapeId, button.dataset.shape_name);
        }.bind(this),
      );
    }

    try {
      const response = await fetch(this.#shapeManagementURL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Splice system shapes from the data
      data.splice(0, this.#defaultShapes.length);
      data.forEach((shape) => {
        this.#addItemButtonIntoList(shape.name, shape.id);
      });
    } catch (error) {
      console.error("Error fetching shapes:", error);
    }
  }

  /**
   * Adds a new item button into the shape list.
   * @param {string} name - The name of the shape.
   * @param {string} id - The ID of the shape.
   * @return {void}
   */
  #addItemButtonIntoList(name, id) {
    const newShapeButton = document.createElement("button");
    newShapeButton.classList.add("btn", "btn-secondary", "mb-2");
    newShapeButton.dataset.shape_name = name;
    newShapeButton.dataset.id = id;
    newShapeButton.textContent = name;
    newShapeButton.id = "add-" + id;
    newShapeButton.addEventListener(
      "click",
      function () {
        this.#buttonClickHandler("custom", id, name);
      }.bind(this),
    );
    this.#listContainer.appendChild(newShapeButton);
  }
}

export default ShapeListUserInterface;
