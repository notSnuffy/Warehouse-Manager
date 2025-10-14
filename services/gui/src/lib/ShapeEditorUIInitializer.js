import { DEFAULT_SHAPES } from "@scenes/ShapeEditor";
import { API_URL } from "@/config";
import { createContainerSnapshotFromShapes } from "@utils/shapes";
import {
  addButtonHandler,
  populateShapeList,
  addItemButtonIntoList,
} from "@utils/UIHelperFunctions";

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
   * @param {ShapeModalUserInterface} shapeModalUI - Function to handle shape modal UI
   * @param {ShapeInstructionsHandler} instructionsHandler - Instructions handler
   * @static
   */
  static initialize(
    handleMoveButtonClick,
    handleSelectButtonClick,
    addShape,
    selectHide,
    getEditorShapes,
    shapeModalUI,
    instructionsHandler,
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

    //initializeAddShapeModal(addShape);
    populateShapeList(shapeModalUI);

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

      console.log("ADD WAY TO SET PUBLIC FLAG");
      let publicFlag = false;

      console.log(getEditorShapes());

      const shapes = getEditorShapes();
      console.log(shapes);

      if (shapes.length === 0) {
        alert("Please add at least one shape before saving.");
        return;
      }

      let shape = {
        name: shapeName,
        type: "CONTAINER",
        public: publicFlag,
        instructions: instructionsHandler.convertToInstructions(
          createContainerSnapshotFromShapes(shapes),
        ),
      };

      console.log("Shape to save:", shape);

      const currentShapeIdElement = document.getElementById("currentShapeId");
      const currentShapeId = currentShapeIdElement
        ? currentShapeIdElement.value
        : "";
      const isUpdate = currentShapeId !== "";

      const method = isUpdate ? "PUT" : "POST";
      const endpoint = isUpdate
        ? `/shape-management/shapes/${currentShapeId}`
        : "/shape-management/shapes";

      try {
        const response = await fetch(API_URL + endpoint, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(shape),
        });

        const data = await response.json();
        if (!response.ok) {
          if (data.errors && data.errors.length > 0) {
            alert(data.errors.join("\n"));
          }
          console.error("Failed to save shape:", data);
          return;
        }
        if (isUpdate) {
          const existingShapeButton = document.getElementById(`add-${data.id}`);
          if (existingShapeButton) {
            existingShapeButton.textContent = data.name;
            existingShapeButton.dataset.shape_name = data.name;
          }

          alert("Shape updated successfully!");
          return;
        }

        addItemButtonIntoList(data.name, data.id, shapeModalUI);
        alert("Shape saved successfully!");
      } catch (error) {
        console.error(error);
      }
    });
  }
}

export default ShapeEditorUIInitializer;
