import {
  initializeAddShapeModal,
  populateShapeList,
} from "@utils/UIHelperFunctions";
import {
  preprocessShapesForSaving,
  saveShapeAsInstructions,
} from "@utils/shapes";
import { Modal } from "bootstrap";
import { DEFAULT_SHAPES } from "@scenes/ShapeEditor";
import { API_URL } from "@/config";

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
   * Map to store shape IDs
   * @type {Map<string, string>}
   * @private
   * @static
   * @default new Map()
   */
  static #shapeIdMap = new Map();

  /**
   * Pending furniture data
   * @type {Object|null}
   * @private
   * @static
   * @default null
   */
  static #pendingFurniture = null;

  /**
   * Adds an item to the top-down view data list
   * @param {string} name - The name of the item
   * @param {string} id - The ID of the item
   * @static
   * @private
   */
  static #addItemToTopDownViewDataList(name, id) {
    const topDownViewDataList = document.getElementById("topDownViewOptions");

    const option = document.createElement("option");
    option.value = name;

    FurnitureEditorUIInitializer.#shapeIdMap.set(name, id);

    topDownViewDataList.appendChild(option);
  }

  static #populateTopDownViewDataList() {
    const itemsMenuButtonsElement = document.getElementById("itemsMenuButtons");
    const buttons = itemsMenuButtonsElement.querySelectorAll("button");

    buttons.forEach((button) => {
      let shapeName = button.dataset.shape_name;
      if (DEFAULT_SHAPES.includes(shapeName)) {
        shapeName = shapeName.charAt(0).toUpperCase() + shapeName.slice(1);
      }
      const shapeId = button.dataset.id;
      if (shapeName && shapeId) {
        FurnitureEditorUIInitializer.#addItemToTopDownViewDataList(
          shapeName,
          shapeId,
        );
      }
    });
  }

  /**
   * Initializes the UI
   * @param {Function} handleMoveButtonClick - Function to handle move button click
   * @param {Function} handleSelectButtonClick - Function to handle select button click
   * @param {Function} addShape - Function to add a shape
   * @param {Function} selectHide - Function to hide selection
   * @param {Function} getEditorShapes - Function to get editor shapes
   * @param {Function} getEditorZones - Function to get editor zones
   * @static
   */
  static async initialize(
    addShape,
    selectHide,
    getEditorShapes,
    getEditorZones,
  ) {
    if (FurnitureEditorUIInitializer.#initialized) {
      return;
    }

    FurnitureEditorUIInitializer.#initialized = true;

    initializeAddShapeModal(addShape);
    const newShapeModalElement = document.getElementById("newShapeModal");
    newShapeModalElement.addEventListener("show.bs.modal", function () {
      const isAddZone = document.getElementById("addZoneSwitch").checked;
      if (isAddZone) {
        document.getElementById("colorGroup").hidden = true;
      }
    });
    newShapeModalElement.addEventListener("hide.bs.modal", function () {
      document.getElementById("colorGroup").hidden = false;
      const isAddZone = document.getElementById("addZoneSwitch").checked;
      if (isAddZone) {
        document.getElementById("shapeColor").value = "#563d7c";
      }
    });
    await populateShapeList();
    FurnitureEditorUIInitializer.#populateTopDownViewDataList();

    const saveButton = document.getElementById("saveButton");
    saveButton.addEventListener("click", async function () {
      selectHide();

      const furnitureName = document.getElementById("furnitureName").value;
      console.log(furnitureName);
      if (furnitureName === "") {
        alert("Please enter a shape name");
        return;
      }

      const shapes = getEditorShapes();
      const zones = getEditorZones();

      if (shapes.length === 0) {
        alert("Please add at least one shape before saving");
        return;
      }

      const furnitureShapes = [];
      const preprocessedShapes = preprocessShapesForSaving(shapes);
      preprocessedShapes.forEach((shape) => {
        furnitureShapes.push({
          shapeId: shape.shapeId,
          shapeVersion: shape.shapeVersion,
          instructions: saveShapeAsInstructions(shape),
        });
      });

      const furnitureZones = [];
      const preprocessedZones = preprocessShapesForSaving(zones);
      let index = 0;
      preprocessedZones.forEach((zone) => {
        furnitureZones.push({
          name: "Zone " + ++index,
          shape: {
            shapeId: zone.shapeId,
            shapeVersion: zone.shapeVersion,
            instructions: saveShapeAsInstructions(zone),
          },
        });
      });

      FurnitureEditorUIInitializer.#pendingFurniture = {
        name: furnitureName,
        shapes: furnitureShapes,
        zones: furnitureZones,
        topDownViewId: null,
      };

      const additionalDataModalElement = document.getElementById(
        "additionalDataModal",
      );
      const additionalDataModal = new Modal(additionalDataModalElement);
      additionalDataModal.show();
    });

    const additionalDataConfirmButtonElement = document.getElementById(
      "additionalDataConfirmButton",
    );
    additionalDataConfirmButtonElement.addEventListener("click", async () => {
      if (!FurnitureEditorUIInitializer.#pendingFurniture) {
        console.error("No pending furniture data to save.");
        return;
      }

      const topDownViewElement = document.getElementById("topDownView");
      const topDownViewShapeName = topDownViewElement.value;
      if (!topDownViewShapeName) {
        alert("Please select a top-down view shape.");
        return;
      }
      FurnitureEditorUIInitializer.#pendingFurniture.topDownViewId =
        FurnitureEditorUIInitializer.#shapeIdMap.get(topDownViewShapeName);

      console.log(
        "Furniture to save:",
        FurnitureEditorUIInitializer.#pendingFurniture,
      );

      const currentFurnitureIdElement =
        document.getElementById("currentFurnitureId");
      const currentFurnitureId = currentFurnitureIdElement
        ? currentFurnitureIdElement.value
        : "";
      const isUpdate = currentFurnitureId !== "";

      const method = isUpdate ? "PUT" : "POST";
      const endpoint = isUpdate
        ? `/furniture-management/furniture/${currentFurnitureId}`
        : "/furniture-management/furniture";

      try {
        const response = await fetch(API_URL + endpoint, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(FurnitureEditorUIInitializer.#pendingFurniture),
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
      FurnitureEditorUIInitializer.#pendingFurniture = null;
      const modalElement = document.getElementById("additionalDataModal");
      const modal = Modal.getInstance(modalElement);
      modal.hide();
    });
  }
}

export default FurnitureEditorUIInitializer;
