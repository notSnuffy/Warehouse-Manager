import { API_URL } from "../config";
import Phaser from "phaser";
import { populateFloorViewItemList } from "../lib/functions/UIHelperFunctions";
import { buildShapeFromInstructions } from "../lib/functions/shapes";

class FloorView extends Phaser.Scene {
  /**
   * Map of furniture instances by their IDs
   * @type {Map<string, Object>}
   * @private
   * @default new Map()
   */
  #furnitureInstances = new Map();

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
   * Map of items in the item list
   * @type {Map<string, Object>|null}
   * @private
   * @default null
   */
  #itemMap = null;

  /**
   * Getter for the item map
   * @returns {Map<string, Object>|null} - The item map
   * @public
   */
  get itemMap() {
    return this.#itemMap;
  }

  /**
   * Moves an item between zones
   * @param {string} previousZoneId - The ID of the previous zone
   * @param {string} newZoneId - The ID of the new zone
   * @param {string} itemId - The ID of the item to move
   * @return {void}
   * @public
   */
  moveItemBetweenZones(previousZoneId, newZoneId, itemId) {
    console.log(
      `Moving item ${itemId} from zone ${previousZoneId} to zone ${newZoneId}`,
    );
    this.#furnitureInstances.forEach((furnitureInstance) => {
      furnitureInstance.zoneInstances.forEach((zoneInstance) => {
        let item = this.#itemMap.get(itemId).item;
        if (zoneInstance.id === previousZoneId) {
          if (!zoneInstance.items[itemId]) {
            console.warn(`Item ${itemId} not found in zone ${previousZoneId}`);
            return;
          }
          delete zoneInstance.items[itemId];
        }
        if (zoneInstance.id === newZoneId) {
          zoneInstance.items[itemId] = item;
        }
      });
    });
  }

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
    this.add
      .line(0, 0, corner1.x, corner1.y, corner2.x, corner2.y, 0xffffff)
      .setOrigin(0, 0)
      .setLineWidth(10);
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

    const viewElementNameElement = document.getElementById("viewElementName");
    viewElementNameElement.textContent = `${floorData.name}`;

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

      this.#furnitureInstances.set(furnitureInstanceId, furnitureData);
    });
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
    console.log("Hit test results:", [...hits]);

    if (hits.length === 0) {
      if (!this.#hoverTimer) {
        return;
      }

      this.#hoverTimer.remove();
      this.#hoverTimer = null;
      this.#lastHover = null;
      return;
    }

    console.log("Last hover:", this.#lastHover);
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
        furnitureInstance: this.#furnitureInstances.get(
          topHit.furnitureInstanceId,
        ),
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
    const backButtonElement = document.getElementById("backButton");
    backButtonElement;

    const urlParams = new URLSearchParams(window.location.search);
    const floorId = urlParams.get("floorId");
    if (floorId) {
      await this.#loadFloor(floorId);
    }

    this.#itemMap = await populateFloorViewItemList((value) => {
      this.#isDragging = value;
    });

    this.#addCanvasHoverHandler();
    console.log("Canvas:", this.game.canvas);

    const saveButtonElement = document.getElementById("saveButton");
    saveButtonElement.addEventListener("click", async () => {
      const changedItems = [];
      this.#itemMap.forEach((item, itemId) => {
        if (!item.changed) {
          return;
        }

        changedItems.push({
          itemId: itemId,
          newParentId: item.item.parentId,
          newZoneId: item.item.zoneId,
          newFloorId: item.item.floorId,
        });
      });
      console.log("Changed items to save:", changedItems);
      try {
        const response = await fetch(
          `${API_URL}/item-management/items/move/batch`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(changedItems),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.errors && errorData.errors.length > 0) {
            alert(errorData.errors.join("\n"));
          } else {
            alert("Failed to save item changes.");
          }
          console.error("Failed to save item changes:", errorData);
          return;
        }
      } catch (error) {
        alert(
          "Error saving item changes. Please check the console for details.",
        );
        console.error("Error loading furniture:", error);
      }
    });

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
        }
        this.#lastHover = null;
      },
      this,
    );
    this.events.on("wake", () => {
      console.log("FloorView scene is waking up.");
      console.log(this.#itemMap);
      console.log(this.#furnitureInstances);
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
