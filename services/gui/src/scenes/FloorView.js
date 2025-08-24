import { API_URL } from "../config";
import Phaser from "phaser";
import { populateFloorViewItemList } from "../lib/functions/UIHelperFunctions";
import { buildShapeFromInstructions } from "../lib/functions/shapes";

class FloorView extends Phaser.Scene {
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
   * If item is being dragged
   * @type {boolean}
   * @private
   * @default false
   */
  #isDragging = false;

  /**
   * Getter for the dragging state
   * @returns {boolean} - True if an item is being dragged, false otherwise
   */
  get isDragging() {
    return this.#isDragging;
  }

  /**
   * Last hovered item
   * @type {Phaser.GameObjects.GameObject|null}
   * @private
   * @default null
   */
  #lastHover = null;

  /**
   * Timer for hover events
   * @type {Phaser.Time.Clock|null}
   * @private
   * @default null
   */
  #hoverTimer = null;

  /**
   * Handler for canvas hover events
   * @type {Function|null}
   * @private
   * @default null
   */
  #hoverCanvasHandler = null;

  /**
   * Constructor for the FloorView scene
   * @constructor
   */
  constructor() {
    super("FloorView");
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
   * Adds a corner to the floor editor
   * @param {number} positionX - The x-coordinate of the corner
   * @param {number} positionY - The y-coordinate of the corner
   * @private
   * @return {Phaser.GameObjects.Circle} - The created corner object
   */
  #addCorner(positionX = 100, positionY = 100) {
    const corner = this.add.circle(positionX, positionY, 20, 0xffffff);

    this.#graph.set(corner, new Map());

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
      const furnitureInstanceId = furnitureData.id;
      const name = furnitureData.furniture.name;

      const furniture = buildShapeFromInstructions(
        furnitureInstructions,
        this,
        0xffffff,
      )[0];

      furniture.id = shapeId;
      furniture.furnitureId = furnitureId;
      furniture.furnitureInstanceId = furnitureInstanceId;

      const label = this.add.text(furniture.x, furniture.y, name, {
        fontSize: "16px",
        color: "#00ff00",
      });
      label.setOrigin(0.5, 0.5);
      furniture.label = label;

      furniture.setInteractive();

      this.#furniture.push(furniture);
    });
    console.log(this.#furniture);
  }

  /**
   * Handles the dragover event on the canvas
   * @private
   * @param {Event} e - The dragover event
   * @return {void}
   */
  #handleCanvasHover(e) {
    e.preventDefault();
    console.log("FloorView dragover event triggered");

    if (!this.#isDragging) {
      return;
    }

    const gameCanvas = this.game.canvas;
    const canvasBoundingRect = gameCanvas.getBoundingClientRect();
    console.log("Canvas bounding rect:", canvasBoundingRect);

    console.log(this.scale);

    const scaleX = this.scale.displayScale.x;
    const scaleY = this.scale.displayScale.y;

    const canvasPointerX = (e.clientX - canvasBoundingRect.x) * scaleX;
    const canvasPointerY = (e.clientY - canvasBoundingRect.y) * scaleY;
    console.log(`Pointer position: (${canvasPointerX}, ${canvasPointerY})`);

    const pointer = this.input.activePointer;
    pointer.x = canvasPointerX;
    pointer.y = canvasPointerY;

    const hits = this.input.hitTestPointer(pointer);

    if (hits.length === 0) {
      if (!this.#hoverTimer) {
        return;
      }

      this.#hoverTimer.remove();
      this.#hoverTimer = null;
      this.#lastHover = null;
      return;
    }

    if (this.#hoverTimer) {
      return;
    }

    const topHit = hits[0];
    if (this.#lastHover && this.#lastHover === topHit) {
      return;
    }

    this.#hoverTimer = this.time.delayedCall(500, () => {
      console.log("Dragged element hovered over box long enough!");
      console.log([...hits]);
      this.scene.sleep();
      this.scene.launch("FurnitureView", {
        furnitureInstanceId: topHit.furnitureInstanceId,
      });
      this.scene.bringToTop("FurnitureView");
      if (this.#hoverTimer) {
        this.#hoverTimer.remove();
        this.#hoverTimer = null;
        this.#lastHover = null;
      }
      this.#lastHover = topHit;
    });
  }

  /**
   * Adds a hover handler to the game canvas
   * @private
   * @return {void}
   */
  #addCanvasHoverHandler() {
    const gameCanvas = this.game.canvas;

    this.#hoverCanvasHandler = this.#handleCanvasHover.bind(this);
    gameCanvas.addEventListener("dragover", this.#hoverCanvasHandler);
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

    populateFloorViewItemList((value) => {
      this.#isDragging = value;
    });

    this.#addCanvasHoverHandler();
    console.log("Canvas:", this.game.canvas);

    this.events.on(
      "sleep",
      () => {
        console.log("FloorView scene is going to sleep.");
        console.log("Removing canvas hover handler.");
        this.game.canvas.removeEventListener(
          "dragover",
          this.#hoverCanvasHandler,
        );
        this.#hoverCanvasHandler = null;
        console.log("Canvas:", this.game.canvas);
        if (this.#hoverTimer) {
          this.#hoverTimer.remove();
          this.#hoverTimer = null;
          this.#lastHover = null;
        }
      },
      this,
    );
    this.events.on("wake", () => {
      this.#addCanvasHoverHandler();
    });
  }
  /**
   * Updates the scene
   * @public
   */
  update() {}
}

export { FloorView };
