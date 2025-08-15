import {
  addButtonHandler,
  initializeAddShapeModal,
  populateShapeList,
} from "../lib/functions/UIHelperFunctions";

/**
 * @class FurnitureEditorUIInitializer
 * @classdesc Class that initializes UI for the Furniture Editor.
 */
class FurnitureEditorUIInitializer {
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
   * @param {Function} selectHide - Function to hide selection
   * @param {Function} getEditorShapes - Function to get editor shapes
   * @static
   */
  static initialize(
    handleMoveButtonClick,
    handleSelectButtonClick,
    addShape,
    selectHide,
    getEditorShapes,
  ) {
    if (FurnitureEditorUIInitializer.#initialized) {
      return;
    }

    FurnitureEditorUIInitializer.#initialized = true;

    const menuBar = document.getElementById("menuBar");
    menuBar.hidden = false;
    const itemsMenu = document.getElementById("itemsMenu");
    itemsMenu.hidden = false;

    addButtonHandler("moveButton", "click", handleMoveButtonClick);
    addButtonHandler("selectButton", "click", handleSelectButtonClick);

    initializeAddShapeModal(addShape);
    const modalElement = document.getElementById("newShapeModal");
    modalElement.addEventListener("show.bs.modal", function () {
      const isAddZone = document.getElementById("addZoneSwitch").checked;
      if (isAddZone) {
        document.getElementById("colorGroup").hidden = true;
      }
    });
    modalElement.addEventListener("hide.bs.modal", function () {
      document.getElementById("colorGroup").hidden = false;
      const isAddZone = document.getElementById("addZoneSwitch").checked;
      if (isAddZone) {
        document.getElementById("shapeColor").value = "#563d7c";
      }
    });
    populateShapeList();

    const saveButton = document.getElementById("saveButton");
    saveButton.addEventListener("click", async function () {
      selectHide();

      const furnitureName = document.getElementById("furnitureName").value;
      console.log(furnitureName);
      if (furnitureName === "") {
        alert("Please enter a shape name");
        return;
      }
      console.log(getEditorShapes());
    });
  }
}

export default FurnitureEditorUIInitializer;
