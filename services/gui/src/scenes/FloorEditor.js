import { API_URL } from "../config";
import Phaser from "phaser";
import MoveManager from "../lib/move/MoveManager";
import SelectShapeManager from "../lib/select/SelectShapeManager";
import FloorEditorUIInitializer from "../lib/FloorEditorUIInitializer";
import { buildShapeFromInstructions } from "../lib/functions/shapes";

class FloorEditor extends Phaser.Scene {
  /**
   * Graph representing the floor layout
   * @type {Map<Phaser.GameObjects.Circle, Map<Phaser.GameObjects.Circle, Phaser.GameObjects.Line>>}
   * @private
   * @default new Map()
   */
  #graph = new Map();

  /**
   * Array of furniture in the scene
   * @type {Phaser.GameObjects.Shape[]}
   * @private
   */
  #furniture = [];

  /**
   * Array to hold selected corners
   * @type {Phaser.GameObjects.Circle[]}
   * @private
   * @default []
   */
  #selectedCorners = [];

  /**
   * Preview corner before placement
   * @type {Phaser.GameObjects.Circle|null}
   * @private
   * @default null
   */
  #cornerPreview = null;

  /**
   * Current tool selected
   * @type {string}
   * @default "move"
   * @private
   */
  #currentTool = "move";

  /**
   * Getter for the currently active tool
   */
  get activeTool() {
    return this.#currentTool;
  }

  /**
   * Move manager
   * @type {MoveManager}
   * @default null
   * @private
   */
  #moveManager = null;

  /**
   * Select manager
   * Also handles rotation and resizing from resize:ResizeManager and rotation:RotationManager
   * @type {SelectShapeManager}
   * @default null
   * @private
   */
  #selectManager = null;
  /**
   * Constructor for the FloorEditor scene
   * @constructor
   */
  constructor() {
    super("FloorEditor");
  }

  /**
   * Initializes the scene
   * @public
   */
  init() {}

  /**
   * Creates a wall between two corners
   * @private
   * @param {Phaser.GameObjects.Circle} corner1 - The first corner
   * @param {Phaser.GameObjects.Circle} corner2 - The second corner
   * @return {void}
   */
  #createWall(corner1, corner2) {
    if (corner1 === corner2) {
      console.warn("Cannot create a wall between the same corner.");
      return;
    }

    if (this.#graph.get(corner1).has(corner2)) {
      console.warn("A wall already exists between these corners.");
      return;
    }

    const wall = this.add
      .line(0, 0, corner1.x, corner1.y, corner2.x, corner2.y, 0xffffff)
      .setOrigin(0, 0)
      .setLineWidth(10);

    this.#graph.get(corner1).set(corner2, wall);
    this.#graph.get(corner2).set(corner1, wall);
  }

  /**
   * Updates the walls connected to a corner
   * @private
   * @param {Phaser.GameObjects.Circle} corner - The corner to update walls for
   * @return {void}
   */
  #updateWalls(corner) {
    const connectedCorners = this.#graph.get(corner);

    connectedCorners.forEach((wall, otherCorner) => {
      wall.setTo(corner.x, corner.y, otherCorner.x, otherCorner.y);
    });
  }

  /**
   * Adds a corner to the floor editor
   * @param {number} positionX - The x-coordinate of the corner
   * @param {number} positionY - The y-coordinate of the corner
   * @private
   * @return {Phaser.GameObjects.Circle} - The created corner object
   */
  #addCorner(positionX = 100, positionY = 100) {
    const corner = this.add
      .circle(positionX, positionY, 20, 0xffffff)
      .setInteractive({ draggable: true });

    this.#graph.set(corner, new Map());

    corner.on("drag", (_pointer, dragX, dragY) => {
      if (this.#currentTool !== "move") {
        return;
      }

      corner.setPosition(dragX, dragY);
      this.#updateWalls(corner);
    });

    corner.on("pointerdown", (_pointer, _x, _y, event) => {
      event.stopPropagation();
      if (this.#currentTool !== "select") {
        return;
      }

      if (!this.#selectedCorners.includes(corner)) {
        corner.setFillStyle(0xff0000);
        this.#selectedCorners.push(corner);
      }

      if (this.#selectedCorners.length === 2) {
        this.#createWall(this.#selectedCorners[0], this.#selectedCorners[1]);
        this.#selectedCorners.forEach((c) => c.setFillStyle(0xffffff));
        this.#selectedCorners = [];
      }
    });
    return corner;
  }

  /**
   * Loads the floor data from the API
   * @param {string} floorId - The ID of the floor to load
   * @private
   * @returns {Promise<Object>} - The floor data
   * @throws {Error} - If the fetch fails or the response is not ok
   * @async
   */
  async #loadFloorData(floorId) {
    try {
      const response = await fetch(
        `${API_URL}/floor-management/floors/${floorId}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch floor data.");
      }
      const floorData = await response.json();
      console.log("Floor data fetched successfully:", floorData);
      return floorData;
    } catch (error) {
      console.error("Error fetching floor data:", error);
      alert("Failed to load floor data. Please check the console for details.");
    }
  }

  /**
   * Loads the floor by its ID
   * @param {string} floorId - The ID of the floor to load
   * @private
   * @async
   */
  async #loadFloor(floorId) {
    const floorData = await this.#loadFloorData(floorId);
    const floorNameInput = document.getElementById("floorName");
    floorNameInput.value = floorData.name;

    const currentFloorIdElement = document.getElementById("currentFloorId");
    currentFloorIdElement.value = floorId;

    const cornerMap = new Map();

    floorData.corners.forEach((cornerData) => {
      const corner = this.#addCorner(
        cornerData.positionX,
        cornerData.positionY,
      );
      cornerMap.set(cornerData.id, corner);
    });

    floorData.walls.forEach((wallData) => {
      const startCorner = cornerMap.get(wallData.startCornerId);
      const endCorner = cornerMap.get(wallData.endCornerId);
      if (startCorner && endCorner) {
        // Check if the wall already exists
        if (this.#graph.get(startCorner).has(endCorner)) {
          return;
        }
        this.#createWall(startCorner, endCorner);
      } else {
        console.warn("Invalid corners for wall:", wallData);
      }
    });

    floorData.furniture.forEach((furnitureData) => {
      const furnitureInstructions =
        furnitureData.topDownViewInstance.instructions;
      const shapeId = furnitureData.topDownViewInstance.shape.id;
      const furnitureId = furnitureData.furniture.id;
      const name = furnitureData.furniture.name;

      const furniture = buildShapeFromInstructions(
        furnitureInstructions,
        this,
        0xffffff,
      )[0];

      furniture.id = shapeId;
      furniture.furnitureId = furnitureId;
      furniture.furnitureInstanceId = furnitureData.id;

      const label = this.add.text(furniture.x, furniture.y, name, {
        fontSize: "16px",
        color: "#00ff00",
      });
      label.setOrigin(0.5, 0.5);
      furniture.label = label;

      this.#furniture.push(furniture);
      furniture.setInteractive({ draggable: true });
      this.#moveManager.create(furniture);
      this.#selectManager.create(furniture);
    });
    console.log(this.#furniture);
  }

  /**
   * Creates the scene
   * @public
   */
  async create() {
    this.#selectManager = new SelectShapeManager(this);
    this.#moveManager = new MoveManager(this);

    const urlParams = new URLSearchParams(window.location.search);
    const floorId = urlParams.get("floorId");
    if (floorId) {
      await this.#loadFloor(floorId);
    }

    /**
     * Handles the move button click event
     */
    const handleMoveButtonClick = function () {
      this.#currentTool = "move";
      this.#selectedCorners.forEach((corner) => {
        corner.setFillStyle(0xffffff);
      });
      this.#selectedCorners = [];
      this.#selectManager.hide();
    }.bind(this);

    const handleSelectButtonClick = function () {
      this.#currentTool = "select";
      this.#selectedCorners.forEach((corner) => {
        corner.setFillStyle(0xffffff);
      });
      this.#selectedCorners = [];
    }.bind(this);

    const addFurniture = async function (parameters) {
      const id = parameters.id;

      try {
        const response = await fetch(
          API_URL +
            "/furniture-management/furniture/" +
            id +
            "/topDownView/template",
        );
        if (!response.ok) {
          throw new Error("Failed to fetch furniture template.");
        }

        const templateData = await response.json();
        const instructions = templateData.shape.instructions;
        // Build from instructions returns array to make it more generic
        // but we only expect one shape to be returned
        const rebuildTemplate = buildShapeFromInstructions(
          instructions,
          this,
          parameters.color,
        )[0];

        rebuildTemplate.id = templateData.shape.shape.id;
        rebuildTemplate.furnitureId = parseInt(id, 10);

        rebuildTemplate.setPosition(parameters.x, parameters.y);
        rebuildTemplate.setDisplaySize(parameters.width, parameters.height);
        rebuildTemplate.setRotation(parameters.rotation);

        const label = this.add.text(
          rebuildTemplate.x,
          rebuildTemplate.y,
          parameters.name,
          {
            fontSize: "16px",
            color: parameters.textColor,
          },
        );
        label.setOrigin(0.5, 0.5);
        rebuildTemplate.label = label;

        this.#furniture.push(rebuildTemplate);
        rebuildTemplate.setInteractive({ draggable: true });
        this.#moveManager.create(rebuildTemplate);
        this.#selectManager.create(rebuildTemplate);
      } catch (error) {
        console.error("Error fetching shape template:", error);
      }
    }.bind(this);

    FloorEditorUIInitializer.initialize(
      handleMoveButtonClick,
      handleSelectButtonClick,
      addFurniture,
      this.#selectManager.hide.bind(this.#selectManager),
      () => this.#furniture,
      () => this.#graph,
    );

    window.addEventListener("pointermove", (event) => {
      const canvas = this.game.canvas;
      const canvasBounds = canvas.getBoundingClientRect();

      const scaleX = this.scale.displayScale.x;
      const scaleY = this.scale.displayScale.y;

      const canvasPointer = {
        x: (event.clientX - canvasBounds.x) * scaleX,
        y: (event.clientY - canvasBounds.y) * scaleY,
      };

      const addCornerButton = document.getElementById("addCornerButton");
      if (!addCornerButton.classList.contains("active")) {
        if (this.#cornerPreview) {
          this.#cornerPreview.destroy();
          this.#cornerPreview = null;
        }
        return;
      }

      let withinWidth = true;
      if (canvasPointer.x < 0 || canvasPointer.x > this.cameras.main.width) {
        withinWidth = false;
      }
      let withinHeight = true;
      if (canvasPointer.y < 0 || canvasPointer.y > this.cameras.main.height) {
        withinHeight = false;
      }
      if (!this.#cornerPreview) {
        this.#cornerPreview = this.add.circle(
          canvasPointer.x,
          canvasPointer.y,
          20,
          0x888888,
        );
      } else {
        if (withinWidth) {
          this.#cornerPreview.x = canvasPointer.x;
        }
        if (withinHeight) {
          this.#cornerPreview.y = canvasPointer.y;
        }
      }
    });

    this.input.on("pointerdown", (event) => {
      this.#selectManager.hide();
      if (this.#currentTool === "select") {
        this.#selectedCorners.forEach((corner) => {
          corner.setFillStyle(0xffffff);
        });
        this.#selectedCorners = [];
      }

      const addCornerButton = document.getElementById("addCornerButton");
      if (addCornerButton.classList.contains("active")) {
        if (this.#cornerPreview) {
          this.#cornerPreview.destroy();
          this.#cornerPreview = null;
        }
        this.#addCorner(event.x, event.y);
      }
    });

    this.events.on("shapeMoved", (shape) => {
      shape.label.setPosition(shape.x, shape.y);
      shape.label.setToTop();
    });

    this.events.on("shapeSelected", (shape) => {
      shape.label.setPosition(shape.x, shape.y);
      shape.label.setToTop();
    });

    this.events.on("resize:drag", (shape) => {
      shape.label.setPosition(shape.x, shape.y);
      shape.label.setToTop();
    });
  }
  /**
   * Updates the scene
   * @public
   */
  update() {}
}

export { FloorEditor };
