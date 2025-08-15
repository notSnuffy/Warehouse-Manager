import { DEFAULT_SHAPES } from "../scenes/ShapeEditor";
import { API_URL } from "../config";
import {
  saveShapeInstance,
  saveShapeAsInstructions,
} from "../lib/functions/shapes";
import {
  addButtonHandler,
  initializeAddShapeModal,
  populateShapeList,
  addItemButtonIntoList,
} from "../lib/functions/UIHelperFunctions";

/**
 * @class ShapeEditorUIInitializer
 * @classdesc Class that initializes UI for the Shape Editor.
 */
class ShapeEditorUIInitializer {
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
    if (ShapeEditorUIInitializer.#initialized) {
      return;
    }

    ShapeEditorUIInitializer.#initialized = true;

    const menuBar = document.getElementById("menuBar");
    menuBar.hidden = false;
    const itemsMenu = document.getElementById("itemsMenu");
    itemsMenu.hidden = false;

    addButtonHandler("moveButton", "click", handleMoveButtonClick);
    addButtonHandler("selectButton", "click", handleSelectButtonClick);

    initializeAddShapeModal(addShape);
    populateShapeList();

    const saveButton = document.getElementById("saveButton");
    saveButton.addEventListener("click", async function () {
      selectHide();

      const shapeName = document.getElementById("shapeName").value;
      console.log(shapeName);
      if (shapeName === "") {
        alert("Please enter a shape name");
        return;
      }

      for (const shape of DEFAULT_SHAPES) {
        const capitalizedShapeName =
          shape.charAt(0).toUpperCase() + shape.slice(1);
        if (capitalizedShapeName === shapeName) {
          alert("Shape name already exists");
          return;
        }
      }

      const allShapeItems = document.querySelectorAll("button[data-shape]");
      for (const item of allShapeItems) {
        if (item.dataset.shape === shapeName) {
          alert("Shape name already exists");
          return;
        }
      }

      console.log("ADD WAY TO SET PUBLIC FLAG");
      let publicFlag = false;

      console.log(getEditorShapes());

      const shapes = getEditorShapes();

      if (shapes.length === 0) {
        alert("Please add at least one shape before saving.");
        return;
      }

      let shape = {
        name: shapeName,
        type: "CONTAINER",
        public: publicFlag,
        instructions: saveShapeAsInstructions(saveShapeInstance(shapes)),
      };

      console.log("Shape to save:", shape);
      try {
        const response = await fetch(API_URL + "/shape-management/shapes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(shape),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        addItemButtonIntoList(data.name, data.id);
      } catch (error) {
        console.error(error);
      }
    });
  }
}

export default ShapeEditorUIInitializer;
