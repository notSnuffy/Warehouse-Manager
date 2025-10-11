import { API_URL } from "@/config";
import {
  addButtonHandler,
  initializeAddFurnitureModal,
  populateFurnitureList,
} from "@utils/UIHelperFunctions";
import {
  preprocessShapesForSaving,
  saveShapeAsInstructions,
} from "@utils/shapes";

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

      const preprocessedFurniture = preprocessShapesForSaving(editorFurniture);
      console.log("Editor furniture:", editorFurniture);
      const furniture = preprocessedFurniture.map((furniture, index) => ({
        furnitureId: editorFurniture[index].furnitureId,
        furnitureInstanceId: editorFurniture[index].furnitureInstanceId ?? null,
        shapeId: furniture.shapeId,
        instructions: saveShapeAsInstructions(furniture),
      }));

      console.log("Furniture data to save:", furniture);
      floorData.furniture = furniture;

      console.log("Floor data to save:", floorData);

      const currentFloorIdElement = document.getElementById("currentFloorId");
      const currentFloorId = currentFloorIdElement
        ? currentFloorIdElement.value
        : null;
      const isUpdate = currentFloorId !== "";

      const method = isUpdate ? "PUT" : "POST";
      const endpoint = isUpdate
        ? `/floor-management/floors/${currentFloorId}`
        : `/floor-management/floors`;

      try {
        const response = await fetch(API_URL + endpoint, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(floorData),
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
          alert("Floor updated successfully!");
        } else {
          alert("Floor created successfully!");
        }
      } catch (error) {
        console.error(error);
      }
    });
  }
}

export default FloorEditorUIInitializer;
