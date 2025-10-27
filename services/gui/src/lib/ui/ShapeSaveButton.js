import { capitalizeFirstLetter } from "@utils/string";
import { createContainerSnapshotFromShapes } from "@utils/shapes";
import { DEFAULT_SHAPES } from "@scenes/ShapeEditor";

class ShapeSaveButton {
  #saveButton;
  #shapeNameInput;
  #getShapes;
  #instructionsHandler;
  #shapeManagementURL;
  #shapeListUI;
  constructor(
    saveButtonId,
    shapeNameInputId,
    getShapes,
    instructionsHandler,
    shapeManagementURL,
    shapeListUI,
  ) {
    this.#saveButton = document.getElementById(saveButtonId);
    this.#shapeNameInput = document.getElementById(shapeNameInputId);
    this.#getShapes = getShapes;
    this.#instructionsHandler = instructionsHandler;
    this.#shapeManagementURL = shapeManagementURL;
    this.#shapeListUI = shapeListUI;

    this.#initializeButtonHandler();
  }

  #initializeButtonHandler() {
    this.#saveButton.addEventListener("click", async () => {
      const shapeName = this.#shapeNameInput.value;
      if (shapeName === "") {
        alert("Please enter a shape name");
        return;
      }

      for (const shape of DEFAULT_SHAPES) {
        const capitalizedShapeName = capitalizeFirstLetter(shape);
        if (capitalizedShapeName === shapeName) {
          alert("Shape name already exists");
          return;
        }
      }

      const shapes = this.#getShapes();

      if (shapes.length === 0) {
        alert("Please add at least one shape before saving.");
        return;
      }

      let shape = {
        name: shapeName,
        type: "CONTAINER",
        instructions: this.#instructionsHandler.convertToInstructions(
          createContainerSnapshotFromShapes(shapes),
        ),
      };

      const currentShapeIdElement = document.getElementById("currentShapeId");
      const currentShapeId = currentShapeIdElement
        ? currentShapeIdElement.value
        : "";
      const isUpdate = currentShapeId !== "";

      const method = isUpdate ? "PUT" : "POST";
      const url = isUpdate
        ? this.#shapeManagementURL + `${currentShapeId}`
        : this.#shapeManagementURL;

      try {
        const response = await fetch(url, {
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

        this.#shapeListUI.addShapeIntoList(data.name, data.id);

        alert("Shape saved successfully!");
      } catch (error) {
        console.error(error);
      }
    });
  }
}

export default ShapeSaveButton;
