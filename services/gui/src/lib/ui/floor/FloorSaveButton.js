/**
 * Class representing the save button for floor.
 * @class FloorSaveButton
 */
class FloorSaveButton {
  /**
   * The save button HTML element.
   * @type {HTMLElement}
   */
  #saveButton;

  /**
   * The floor name input HTML element.
   * @type {HTMLElement}
   */
  #floorNameInput;

  /**
   * Function to get furniture.
   * @type {Function}
   */
  #getFurniture;

  /**
   * Function to get graph.
   * @type {Function}
   */
  #getGraph;

  /**
   * Handler for furniture instructions.
   * @type {ShapeInstructionsHandler}
   */
  #instructionsHandler;

  /**
   * URL for floor management.
   * @type {string}
   */
  #floorManagementURL;

  /**
   * Creates an instance of FurnitureSaveButton.
   * @param {string} saveButtonId - The ID of the save button element.
   * @param {string} floorNameInputId - The ID of the floor name input element.
   * @param {Function} getFurniture - Function to get furniture.
   * @param {Function} getGraph - Function to get graph.
   * @param {ShapeInstructionsHandler} instructionsHandler - Handler for shape instructions.
   * @param {string} floorManagementURL - URL for furniture management.
   */
  constructor(
    saveButtonId,
    floorNameInputId,
    getFurniture,
    getGraph,
    instructionsHandler,
    floorManagementURL,
  ) {
    this.#saveButton = document.getElementById(saveButtonId);
    this.#floorNameInput = document.getElementById(floorNameInputId);
    this.#getFurniture = getFurniture;
    this.#getGraph = getGraph;
    this.#instructionsHandler = instructionsHandler;
    this.#floorManagementURL = floorManagementURL;

    this.#initializeButtonHandler();
  }

  /**
   * Initializes the button click handler.
   */
  #initializeButtonHandler() {
    this.#saveButton.addEventListener("click", async () => {
      const floorName = this.#floorNameInput.value;
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

      const graph = this.#getGraph();

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

      const furniture = this.#getFurniture();

      const furnitureTransferObjects = furniture
        .map((item) => {
          const snapshot = item.createSnapshot();
          const instructions =
            this.#instructionsHandler.convertToInstructions(snapshot);
          if (instructions.length === 0) {
            return null;
          }
          return {
            furnitureId: item.metadata.furnitureId,
            furnitureInstanceId: item.metadata.furnitureInstanceId ?? null,
            shapeId: item.metadata.id,
            shapeVersion: item.metadata.version,
            instructions: instructions,
          };
        })
        .filter((item) => item !== null);

      floorData.furniture = furnitureTransferObjects;

      const currentFloorIdElement = document.getElementById("currentFloorId");
      const currentFloorId = currentFloorIdElement
        ? currentFloorIdElement.value
        : null;
      const isUpdate = currentFloorId !== "";

      const method = isUpdate ? "PUT" : "POST";
      const url = isUpdate
        ? this.#floorManagementURL + `/${currentFloorId}`
        : this.#floorManagementURL;

      console.log(floorData);
      try {
        const response = await fetch(url, {
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

export default FloorSaveButton;
