import { API_URL } from "../config";
import Phaser from "phaser";
import MoveManager from "../lib/move/MoveManager";
import SelectShapeManager from "../lib/select/SelectShapeManager";
import FloorEditorUIInitializer from "../lib/FloorEditorUIInitializer";
import { buildShapeFromInstructions } from "../lib/functions/shapes";
import * as Shapes from "../shapes";

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

  async #loadFloor(floorId) {
    const floorData = await this.#loadFloorData(floorId);
    const floorNameInput = document.getElementById("floorName");
    floorNameInput.value = floorData.name;

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
  }

  /**
   * Creates the scene
   * @public
   */
  async create() {
    const urlParams = new URLSearchParams(window.location.search);
    const floorId = urlParams.get("floorId");
    if (floorId) {
      await this.#loadFloor(floorId);
    }

    const addCornerButton = document.getElementById("addCornerButton");
    addCornerButton.addEventListener("click", () => {
      this.#addCorner();
    });

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

        rebuildTemplate.setPosition(parameters.x, parameters.y);
        rebuildTemplate.setDisplaySize(parameters.width, parameters.height);

        rebuildTemplate.id = templateData.shape.shape.id;
        rebuildTemplate.furnitureId = parseInt(id, 10);
        rebuildTemplate.setPosition(0, 0);
        // The container should have the rotation so we reset even though
        // it should be impossible for newly added shape to have rotation
        rebuildTemplate.setRotation(0);
        const label = this.add.text(0, 0, parameters.name, {
          fontSize: "16px",
          color: parameters.textColor,
        });
        label.setOrigin(0.5, 0.5);

        const container = new Shapes.Container(
          this,
          parameters.x,
          parameters.y,
          [rebuildTemplate, label],
        );
        container.setSize(parameters.width, parameters.height);
        container.setRotation(parameters.rotation);
        container.update();

        this.#furniture.push(container);
        container.setInteractive({ draggable: true });
        this.#moveManager.create(container);
        this.#selectManager.create(container);
      } catch (error) {
        console.error("Error fetching shape template:", error);
      }
    }.bind(this);

    this.#selectManager = new SelectShapeManager(this);
    this.#moveManager = new MoveManager(this);

    FloorEditorUIInitializer.initialize(
      handleMoveButtonClick,
      handleSelectButtonClick,
      addFurniture,
      this.#selectManager.hide.bind(this.#selectManager),
      () => this.#furniture,
      () => this.#graph,
    );

    this.input.on("pointerdown", () => {
      this.#selectManager.hide();
      if (this.#currentTool === "select") {
        this.#selectedCorners.forEach((corner) => {
          corner.setFillStyle(0xffffff);
        });
        this.#selectedCorners = [];
      }
    });
  }
  /**
   * Updates the scene
   * @public
   */
  update() {}
}

export { FloorEditor };
