import { API_URL } from "../config";
import {
  addButtonHandler,
  initializeAddFurnitureModal,
  populateFurnitureList,
} from "../lib/functions/UIHelperFunctions";
import {
  preprocessShapesForSaving,
  saveShapeAsInstructions,
} from "../lib/functions/shapes";

/**
 * @class FloorEditorUIInitializer
 * @classdesc Class that initializes UI for the Floor Editor.
 */
class FloorEditorUIInitializer {
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
   * @param {Function} addFurniture - Function to add a furniture
   * @param {Function} selectHide - Function to hide selection
   * @param {Function} getEditorFurniture - Function to get editor furniture
   * @param {Function} getEditorGraph - Function to get editor graph
   * @static
   */
  static initialize(
    handleMoveButtonClick,
    handleSelectButtonClick,
    addFurniture,
    selectHide,
    getEditorFurniture,
    getEditorGraph,
  ) {
    if (FloorEditorUIInitializer.#initialized) {
      return;
    }

    FloorEditorUIInitializer.#initialized = true;

    const menuBar = document.getElementById("menuBar");
    menuBar.hidden = false;
    const itemsMenu = document.getElementById("itemsMenu");
    itemsMenu.hidden = false;

    addButtonHandler("moveButton", "click", handleMoveButtonClick);
    addButtonHandler("selectButton", "click", handleSelectButtonClick);

    initializeAddFurnitureModal(addFurniture);
    populateFurnitureList();

    const saveButton = document.getElementById("saveButton");
    saveButton.addEventListener("click", async function () {
      selectHide();

      const floorName = document.getElementById("floorName").value;
      if (!floorName) {
        alert("Please enter a floor name.");
        return;
      }

      let floorData = {
        name: floorName,
        corners: [],
        walls: [],
      };

      const cornersIds = new Map();

      const graph = getEditorGraph();

      let cornerId = 1;
      graph.forEach((_neighbours, corner) => {
        floorData.corners.push({
          id: cornerId,
          positionX: corner.x,
          positionY: corner.y,
        });
        cornersIds.set(corner, cornerId);
        cornerId++;
      });
      graph.forEach((neighbours, parent) => {
        neighbours.forEach((_wall, child) => {
          floorData.walls.push({
            startCornerId: cornersIds.get(parent),
            endCornerId: cornersIds.get(child),
          });
        });
      });

      const editorFurniture = getEditorFurniture();
      const extractedFurniture = editorFurniture.map((furniture) =>
        furniture.getAt(0),
      );

      const getFurnitureWithWorldCoordinates = (furniture, container) => {
        const furnitureWithWorldCoordinates = Object.create(
          Object.getPrototypeOf(furniture),
        );

        Object.assign(furnitureWithWorldCoordinates, furniture);

        furnitureWithWorldCoordinates.x = container.x;
        furnitureWithWorldCoordinates.y = container.y;
        furnitureWithWorldCoordinates.rotation = container.rotation;

        return furnitureWithWorldCoordinates;
      };

      const furnitureInWorldCoordinates = extractedFurniture.map(
        (furniture, index) =>
          getFurnitureWithWorldCoordinates(furniture, editorFurniture[index]),
      );

      console.log(furnitureInWorldCoordinates);

      const preprocessedFurniture = preprocessShapesForSaving(
        furnitureInWorldCoordinates,
      );
      console.log("Editor furniture:", editorFurniture);
      const furniture = preprocessedFurniture.map((furniture, index) => ({
        furnitureId: extractedFurniture[index].furnitureId,
        shapeId: furniture.shapeId,
        instructions: saveShapeAsInstructions(furniture),
      }));

      console.log("Furniture data to save:", furniture);
      floorData.furniture = furniture;

      console.log("Floor data to save:", floorData);

      try {
        const response = await fetch(`${API_URL}/floor-management/floors`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(floorData),
        });

        if (!response.ok) {
          throw new Error("Failed to save floor data.");
        }

        const result = await response.json();
        console.log("Floor saved successfully:", result);
      } catch (error) {
        console.error("Error saving floor data:", error);
      }
    });
  }
}

export default FloorEditorUIInitializer;
