import FurnitureSaveButtonUserInterface from "./FurnitureSaveButtonUserInterface.js";

/**
 * Builder class for FurnitureSaveButtonUserInterface.
 * @class FurnitureSaveButtonBuilder
 */
class FurnitureSaveButtonBuilder {
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
   * ID of the save button element.
   * @type {string}
   */
  #saveButtonId;

  /**
   * ID of the furniture name input element.
   * @type {string}
   */
  #furnitureNameInputId;

  /**
   * ID of the currently editing furniture element.
   * @type {string}
   */
  #currentlyEditingFurnitureId;

  /**
   * ID of the additional data modal element.
   * @type {string}
   */
  #additionalDataModalId;

  /**
   * ID of the top-down view input element.
   * @type {string}
   */
  #topDownViewInputId;

  /**
   * ID of the top-down view data list element.
   * @type {string}
   */
  #topDownViewDataListId;

  /**
   * ID of the shape list element.
   * @type {string}
   */
  #shapeListElementId;

  /**
   * Creates an instance of FurnitureSaveButtonBuilder.
   */
  constructor() {}

  /**
   * Sets the function to get shapes.
   * @param {Function} getShapes - The function to get shapes.
   * @return {FurnitureSaveButtonBuilder} The builder instance.
   */
  setGetShapes(getShapes) {
    this.#getShapes = getShapes;
    return this;
  }

  /**
   * Sets the function to get zones.
   * @param {Function} getZones - The function to get zones.
   * @return {FurnitureSaveButtonBuilder} The builder instance.
   */
  setGetZones(getZones) {
    this.#getZones = getZones;
    return this;
  }

  /**
   * Sets the shape instructions handler.
   * @param {ShapeInstructionsHandler} shapeInstructionsHandler - The shape instructions handler.
   * @return {FurnitureSaveButtonBuilder} The builder instance.
   */
  setShapeInstructionsHandler(shapeInstructionsHandler) {
    this.#shapeInstructionsHandler = shapeInstructionsHandler;
    return this;
  }

  /**
   * Sets the zone instructions handler.
   * @param {ShapeInstructionsHandler} zoneInstructionsHandler - The zone instructions handler.
   * @return {FurnitureSaveButtonBuilder} The builder instance.
   */
  setZoneInstructionsHandler(zoneInstructionsHandler) {
    this.#zoneInstructionsHandler = zoneInstructionsHandler;
    return this;
  }

  /**
   * Sets the furniture management URL.
   * @param {string} furnitureManagementURL - The furniture management URL.
   * @return {FurnitureSaveButtonBuilder} The builder instance.
   */
  setFurnitureManagementURL(furnitureManagementURL) {
    this.#furnitureManagementURL = furnitureManagementURL;
    return this;
  }

  /**
   * Sets the save button ID.
   * @param {string} saveButtonId - The save button ID.
   * @return {FurnitureSaveButtonBuilder} The builder instance.
   */
  setSaveButtonId(saveButtonId) {
    this.#saveButtonId = saveButtonId;
    return this;
  }

  /**
   * Sets the furniture name input ID.
   * @param {string} furnitureNameInputId - The furniture name input ID.
   * @return {FurnitureSaveButtonBuilder} The builder instance.
   */
  setFurnitureNameInputId(furnitureNameInputId) {
    this.#furnitureNameInputId = furnitureNameInputId;
    return this;
  }

  /**
   * Sets the currently editing furniture ID.
   * @param {string} currentlyEditingFurnitureId - The currently editing furniture ID.
   * @return {FurnitureSaveButtonBuilder} The builder instance.
   */
  setCurrentlyEditingFurnitureId(currentlyEditingFurnitureId) {
    this.#currentlyEditingFurnitureId = currentlyEditingFurnitureId;
    return this;
  }

  /**
   * Sets the additional data modal ID.
   * @param {string} additionalDataModalId - The additional data modal ID.
   * @return {FurnitureSaveButtonBuilder} The builder instance.
   */
  setAdditionalDataModalId(additionalDataModalId) {
    this.#additionalDataModalId = additionalDataModalId;
    return this;
  }

  /**
   * Sets the top-down view input ID.
   * @param {string} topDownViewInputId - The top-down view input ID.
   * @return {FurnitureSaveButtonBuilder} The builder instance.
   */
  setTopDownViewInputId(topDownViewInputId) {
    this.#topDownViewInputId = topDownViewInputId;
    return this;
  }

  /**
   * Sets the top-down view data list ID.
   * @param {string} topDownViewDataListId - The top-down view data list ID.
   * @return {FurnitureSaveButtonBuilder} The builder instance.
   */
  setTopDownViewDataListId(topDownViewDataListId) {
    this.#topDownViewDataListId = topDownViewDataListId;
    return this;
  }

  /**
   * Sets the shape list element ID.
   * @param {string} shapeListElementId - The shape list element ID.
   * @return {FurnitureSaveButtonBuilder} The builder instance.
   */
  setShapeListElementId(shapeListElementId) {
    this.#shapeListElementId = shapeListElementId;
    return this;
  }

  /**
   * Builds and returns the FurnitureSaveButtonUserInterface instance.
   * @return {FurnitureSaveButtonUserInterface} The built FurnitureSaveButtonUserInterface instance.
   * @throws {Error} If any required parameter is missing.
   */
  build() {
    const requiredParams = [
      this.#getShapes,
      this.#getZones,
      this.#shapeInstructionsHandler,
      this.#zoneInstructionsHandler,
      this.#furnitureManagementURL,
      this.#saveButtonId,
      this.#furnitureNameInputId,
      this.#currentlyEditingFurnitureId,
      this.#additionalDataModalId,
      this.#topDownViewInputId,
      this.#topDownViewDataListId,
      this.#shapeListElementId,
    ];
    for (const param of requiredParams) {
      if (!param) {
        throw new Error(
          "Missing required parameter for FurnitureSaveButtonBuilder",
        );
      }
      return new FurnitureSaveButtonUserInterface(
        this.#getShapes,
        this.#getZones,
        this.#shapeInstructionsHandler,
        this.#zoneInstructionsHandler,
        this.#furnitureManagementURL,
        this.#saveButtonId,
        this.#furnitureNameInputId,
        this.#currentlyEditingFurnitureId,
        this.#additionalDataModalId,
        this.#topDownViewInputId,
        this.#topDownViewDataListId,
        this.#shapeListElementId,
      );
    }
  }
}

export default FurnitureSaveButtonBuilder;
