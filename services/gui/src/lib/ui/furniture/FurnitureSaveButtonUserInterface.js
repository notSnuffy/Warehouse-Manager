import FurnitureAdditionalDataModalUserInterface from "./FurnitureAdditionalDataModalUserInterface";

/**
 * Class representing the furniture save button user interface.
 * @class FurnitureSaveButtonUserInterface
 */
class FurnitureSaveButtonUserInterface {
  /**
   * The save button HTML element.
   * @type {HTMLElement}
   */
  #saveButtonElement;

  /**
   * The additional data modal user interface.
   * @type {FurnitureAdditionalDataModalUserInterface}
   */
  #additionalDataModal;

  /**
   * Function to get shapes.
   * @type {Function}
   */
  #getShapes;

  /**
   * Function to get zones.
   * @type {Function}
   */
  #getZones;

  /**
   * Handler for shape instructions.
   * @type {ShapeInstructionsHandler}
   */
  #shapeInstructionsHandler;

  /**
   * Handler for zone instructions.
   * @type {ShapeInstructionsHandler}
   */
  #zoneInstructionsHandler;

  /**
   * URL for furniture management.
   * @type {string}
   */
  #furnitureManagementURL;

  /**
   * The furniture name input HTML element.
   * @type {HTMLElement}
   */
  #furnitureNameInputElement;

  /**
   * The currently editing furniture ID HTML element.
   * @type {HTMLElement}
   */
  #currentlyEditingFurnitureIdElement;

  /**
   * Creates an instance of FurnitureSaveButtonUserInterface.
   * @param {Function} getShapes - Function to get shapes.
   * @param {Function} getZones - Function to get zones.
   * @param {ShapeInstructionsHandler} shapeInstructionsHandler - Handler for shape instructions.
   * @param {ShapeInstructionsHandler} zoneInstructionsHandler - Handler for zone instructions.
   * @param {string} furnitureManagementURL - URL for furniture management.
   * @param {string} saveButtonId - ID of the save button element.
   * @param {string} furnitureNameInputId - ID of the furniture name input element.
   * @param {string} currentlyEditingFurnitureId - ID of the currently editing furniture element.
   * @param {string} additionalDataModalId - ID of the additional data modal element.
   * @param {string} topDownViewInputId - ID of the top-down view input element.
   * @param {string} topDownViewDataListId - ID of the top-down view data list element.
   * @param {string} shapeListElementId - ID of the shape list element.
   */
  constructor(
    getShapes,
    getZones,
    shapeInstructionsHandler,
    zoneInstructionsHandler,
    furnitureManagementURL,
    saveButtonId,
    furnitureNameInputId,
    currentlyEditingFurnitureId,
    additionalDataModalId,
    topDownViewInputId,
    topDownViewDataListId,
    shapeListElementId,
  ) {
    this.#getShapes = getShapes;
    this.#getZones = getZones;
    this.#shapeInstructionsHandler = shapeInstructionsHandler;
    this.#zoneInstructionsHandler = zoneInstructionsHandler;
    this.#furnitureManagementURL = furnitureManagementURL;
    this.#furnitureNameInputElement =
      document.getElementById(furnitureNameInputId);
    this.#currentlyEditingFurnitureIdElement = document.getElementById(
      currentlyEditingFurnitureId,
    );
    this.#saveButtonElement = document.getElementById(saveButtonId);
    this.#additionalDataModal = new FurnitureAdditionalDataModalUserInterface(
      additionalDataModalId,
      topDownViewInputId,
      topDownViewDataListId,
      shapeListElementId,
      this,
    );
    this.#initializeButtonHandler();
  }

  /**
   * Initializes the button handler.
   */
  #initializeButtonHandler() {
    this.#saveButtonElement.addEventListener("click", () => {
      const furnitureName = this.#furnitureNameInputElement.value;
      if (!furnitureName) {
        alert("Please enter a furniture name.");
        return;
      }

      const shapes = this.#getShapes();
      const zones = this.#getZones();

      if (shapes.length === 0) {
        alert("Please add at least one shape before saving");
        return;
      }

      const furnitureShapes = shapes
        .map((shape) => {
          console.log("Processing shape for saving:", shape);
          const snapshot = shape.createSnapshot();
          console.log("Shape snapshot:", snapshot);
          const instructions =
            this.#shapeInstructionsHandler.convertToInstructions(snapshot);
          console.log("Converted instructions:", instructions);
          if (instructions.length === 0) {
            return null;
          }
          return {
            shapeId: shape.metadata.id,
            shapeVersion: shape.metadata.version,
            instructions: instructions,
          };
        })
        .filter((shape) => shape !== null);
      const furnitureZones = zones
        .map((zone) => {
          const snapshot = zone.createSnapshot();
          const instructions =
            this.#zoneInstructionsHandler.convertToInstructions(snapshot);

          if (instructions.length === 0) {
            return null;
          }

          return {
            name: zone.metadata.zoneName,
            shape: {
              shapeId: zone.metadata.id,
              shapeVersion: zone.metadata.version,
              instructions: instructions,
            },
          };
        })
        .filter((zone) => zone !== null);
      const pendingFurniture = {
        name: furnitureName,
        shapes: furnitureShapes,
        zones: furnitureZones,
        topDownViewId: null,
      };
      this.#additionalDataModal.showModal(pendingFurniture);
    });
  }

  /**
   * Saves the furniture data.
   * @param {Object} furnitureData - The furniture data to save.
   */
  async saveFurniture(furnitureData) {
    console.log("Saving furniture data:", furnitureData);
    const currentlyEditingFurnitureId =
      this.#currentlyEditingFurnitureIdElement?.value;
    const isUpdate =
      currentlyEditingFurnitureId && currentlyEditingFurnitureId !== "";

    const method = isUpdate ? "PUT" : "POST";
    const url = isUpdate
      ? this.#furnitureManagementURL + `/${currentlyEditingFurnitureId}`
      : this.#furnitureManagementURL;
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(furnitureData),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.errors && data.errors.length > 0) {
          alert(data.errors.join("\n"));
        }
        console.error("Failed to save furniture:", data);
        return;
      }

      if (isUpdate) {
        alert("Furniture updated successfully!");
      } else {
        alert("Furniture created successfully!");
      }
    } catch (error) {
      console.error(error);
    }
  }
}

export default FurnitureSaveButtonUserInterface;
