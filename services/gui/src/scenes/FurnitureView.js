import Phaser from "phaser";
import { API_URL } from "../config";
import { Modal } from "bootstrap";
import Sortable from "sortablejs";
import { buildShapeFromInstructions } from "../lib/functions/shapes";

/**
 * Represents the furniture view scene
 * @class
 * @extends Phaser.Scene
 */
class FurnitureView extends Phaser.Scene {
  /**
   * Array of shapes in the scene
   * @type {Phaser.GameObjects.Shape[]}
   * @private
   */
  #shapes = [];

  /**
   * Array of placement zones in the furniture
   * @type {Phaser.GameObjects.Shape[]}
   * @private
   */
  #zones = [];

  /**
   * Furniture instance ID of the furniture being viewed
   * @type {number|null}
   * @private
   * @default null
   */
  #furnitureInstanceId = null;

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
   * @type {EventListener|null}
   * @private
   * @default null
   */
  #hoverCanvasHandler = null;

  /**
   * Constructor for the FurnitureView scene
   * @constructor
   */
  constructor() {
    super("FurnitureView");
  }

  /**
   * Loads the furniture instance by its ID
   * @param {string} furnitureId - The ID of the furniture instance to load
   * @private
   * @async
   */
  async #loadFurniture(furnitureId) {
    try {
      const response = await fetch(
        `${API_URL}/furniture-management/furniture/instances/${furnitureId}`,
      );
      const furnitureData = await response.json();
      if (!response.ok) {
        if (furnitureData.errors && furnitureData.errors.length > 0) {
          alert(furnitureData.errors.join("\n"));
        }
        console.error("Failed to load furniture:", furnitureData);
        return;
      }

      if (furnitureData.furniture.shapes) {
        furnitureData.furniture.shapes.forEach((shapeData) => {
          const shape = buildShapeFromInstructions(
            shapeData.instructions,
            this,
          )[0];
          shape.id = shapeData.shape.id;
          this.#shapes.push(shape);
        });
      }

      if (furnitureData.zoneInstances) {
        furnitureData.zoneInstances.forEach((zoneData) => {
          console.log("Zone data:", zoneData);
          const zone = buildShapeFromInstructions(
            zoneData.zone.instructions,
            this,
            0xeb7734,
          )[0];
          zone.id = zoneData.id;
          zone.items = zoneData.itemIds || [];
          zone.setInteractive();
          this.#zones.push(zone);
        });
      }
    } catch (error) {
      console.error("Error loading furniture:", error);
    }
  }

  #handleCanvasHover(e) {
    e.preventDefault();
    console.log("FurnitureView dragover event triggered");

    const floorViewScene = this.scene.get("FloorView");
    if (!floorViewScene || !floorViewScene.isDragging) {
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
    console.log("Hits:", hits);

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
      console.log("Hover timer already set, ignoring dragover event");
      return;
    }

    const topHit = hits[0];
    console.log("Last hover:", this.#lastHover);
    if (this.#lastHover && this.#lastHover === topHit) {
      return;
    }

    this.#hoverTimer = this.time.delayedCall(2000, () => {
      console.log("Dragged element hovered over box long enough!");
      console.log([...hits]);
      console.log(gameCanvas);

      const zoneItemsModalElement = document.getElementById("zoneItemsModal");
      const zoneItemsModal = new Modal(zoneItemsModalElement);

      const zoneItemsListElement = document.getElementById("zoneItemsList");
      zoneItemsListElement.innerHTML = "";
      topHit.items.forEach((itemId) => {
        const itemElement = document.createElement("li");
        itemElement.textContent = `Item ID: ${itemId}`;
        itemElement.classList.add("list-group-item");

        zoneItemsListElement.appendChild(itemElement);
      });

      zoneItemsModal.show();

      if (this.#hoverTimer) {
        this.#hoverTimer.remove();
        this.#hoverTimer = null;
        this.#lastHover = null;
      }
      this.#lastHover = topHit;
      console.log("Last hover set to:", this.#lastHover);
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
   * Initializes the scene
   * @param {Object} data - Data passed to the scene
   * @public
   */
  init(data) {
    this.#furnitureInstanceId = data.furnitureInstanceId || null;
    console.log("Furniture instance ID:", this.#furnitureInstanceId);
  }

  /**
   * Creates the scene
   * @public
   */
  async create() {
    const furnitureId = this.#furnitureInstanceId;
    if (furnitureId) {
      await this.#loadFurniture(furnitureId);
    }

    const zoneItemsListElement = document.getElementById("zoneItemsList");
    Sortable.create(zoneItemsListElement, {
      group: "items",
      animation: 150,
    });

    this.#addCanvasHoverHandler();

    const zoneItemsModalElement = document.getElementById("zoneItemsModal");
    zoneItemsModalElement.addEventListener("hidden.bs.modal", () => {
      console.log("Zone items modal hidden");
      console.log(this.#hoverTimer);
      if (this.#hoverTimer) {
        this.#hoverTimer.remove();
        this.#hoverTimer = null;
      }
      this.#lastHover = null;
    });

    this.events.on("shutdown", () => {
      console.log("FurnitureView scene shutdown");
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
    });
  }

  /**
   * Updates the scene
   * @public
   */
  update() {}
}

export { FurnitureView };
