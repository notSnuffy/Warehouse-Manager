import Phaser from "phaser";
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
   * Furniture instance of the furniture being viewed
   * @type {Object|null}
   * @private
   * @default null
   */
  #furnitureInstance = null;

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
   * Handler for modal hidden events
   * @type {Function|null}
   * @private
   * @default null
   */
  #modalHiddenHandler = null;

  /**
   * Constructor for the FurnitureView scene
   * @constructor
   */
  constructor() {
    super("FurnitureView");
  }

  /**
   * Loads the furniture instance by its ID
   * @param {Object} furnitureInstance - The furniture instance to load
   * @private
   * @async
   */
  #loadFurniture(furnitureInstance) {
    const viewElementNameElement = document.getElementById("viewElementName");
    viewElementNameElement.textContent = furnitureInstance.furniture.name;

    if (furnitureInstance.furniture.shapes) {
      furnitureInstance.furniture.shapes.forEach((shapeData) => {
        const shape = buildShapeFromInstructions(
          shapeData.instructions,
          this,
        )[0];
        shape.id = shapeData.shape.id;
      });
    }

    if (furnitureInstance.zoneInstances) {
      furnitureInstance.zoneInstances.forEach((zoneData) => {
        console.log("Zone data:", zoneData);
        const zone = buildShapeFromInstructions(
          zoneData.zone.shape.instructions,
          this,
          0xeb7734,
        )[0];
        zone.id = zoneData.id;
        zone.items = zoneData.items || new Set();
        zone.setInteractive();
        zone.on("pointerdown", () => {
          const zoneItemsModalElement =
            document.getElementById("zoneItemsModal");
          const zoneItemsModal = new Modal(zoneItemsModalElement);

          const zoneItemsListElement = document.getElementById("zoneItemsList");
          zoneItemsListElement.innerHTML = "";
          zoneItemsListElement.dataset.zoneId = zone.id;

          this.#populateZoneItems(zone.items, zoneItemsListElement);

          this.input.enabled = false;
          zoneItemsModal.show();
        });
      });
    }
  }

  /**
   * Handler for modal hidden events
   * @private
   * @return {void}
   */
  #handleModalHidden() {
    console.log("Zone items modal hidden");
    console.log(this.#hoverTimer);
    if (this.#hoverTimer) {
      this.#hoverTimer.remove();
      this.#hoverTimer = null;
    }
    this.#lastHover = null;
    this.input.enabled = true;
  }

  /**
   * Makes a list sortable using Sortable.js
   * @param {HTMLElement} unorderedListElement - The unordered list element to make sortable
   * @private
   * @return {void}
   */
  #makeSortable(unorderedListElement) {
    Sortable.create(unorderedListElement, {
      group: "items",
      animation: 150,
      fallbackOnBody: true,
      invertSwap: true,
      onAdd: (evt) => {
        const item = evt.item;
        const id = item.dataset.id;
        const itemMap = this.scene.get("FloorView").itemMap;
        const itemData = itemMap.get(parseInt(id, 10));
        const previousList = evt.from;
        console.log("Event onAdd:", evt);
        const thisList = evt.to;
        const newParentId = parseInt(thisList.dataset.parentId, 10);
        const newParentItemData = itemMap.get(newParentId);
        const oldParentId = itemData.parentId;
        let parentId = newParentId;
        while (parentId) {
          if (parentId === parseInt(id, 10)) {
            alert("Cannot move an item into itself.");
            evt.to.removeChild(item);
            return;
          }
          const parentItemData = itemMap.get(parentId);
          parentId = parentItemData.parentId;
        }
        if (oldParentId) {
          const oldParentItemData = itemMap.get(oldParentId);

          oldParentItemData.children.delete(parseInt(id, 10));
        }
        newParentItemData.children.add(parseInt(id, 10));

        itemData.parentId = newParentId;
        itemData.changed = true;
        this.scene
          .get("FloorView")
          .moveItemBetweenZones(itemData.zoneId, null, parseInt(id, 10));
        itemData.zoneId = null;
        itemData.floorId = newParentItemData.floorId;
        console.log("Item data after move:", itemData);
        const updateChildrenFloor = (itemData, floorId) => {
          if (itemData.children && itemData.children.size > 0) {
            itemData.children.forEach((childId) => {
              const childItemData = itemMap.get(childId);
              childItemData.floorId = floorId;
              childItemData.changed = true;
              updateChildrenFloor(childItemData, floorId);
            });
          }
        };
        updateChildrenFloor(itemData, itemData.floorId);

        if (previousList.id === "itemsMenuItems") {
          console.log("Item added from items menu:", itemData);
          const childList = document.createElement("ul");
          childList.classList.add("list-group");
          childList.dataset.parentId = parseInt(id, 10);
          item.appendChild(childList);

          this.#makeSortable(childList);

          if (itemData.children && itemData.children.size > 0) {
            this.#populateZoneItems(itemData.children, childList);
          }
        }
      },
    });
  }

  /**
   * Populates zone items into a given unordered list element
   * @param {Set} items - Set of item ids with which to populate the list
   * @param {HTMLElement} unorderedListElement - The unordered list element to populate
   * @private
   * @return {void}
   */
  #populateZoneItems(items, unorderedListElement) {
    items.forEach((itemId) => {
      const itemMap = this.scene.get("FloorView").itemMap;
      const itemData = itemMap.get(itemId);
      const itemElement = document.createElement("li");
      itemElement.textContent = `${itemData.name}`;
      itemElement.classList.add("list-group-item");
      itemElement.dataset.id = itemId;
      const childList = document.createElement("ul");
      childList.classList.add("list-group");
      childList.dataset.parentId = itemId;
      itemElement.appendChild(childList);

      this.#makeSortable(childList);

      unorderedListElement.appendChild(itemElement);
      if (itemData.children && itemData.children.size > 0) {
        this.#populateZoneItems(itemData.children, childList);
      }
    });
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

    this.#hoverTimer = this.time.delayedCall(500, () => {
      console.log("Dragged element hovered over box long enough!");
      console.log([...hits]);
      console.log(gameCanvas);

      const zoneItemsModalElement = document.getElementById("zoneItemsModal");
      const zoneItemsModal = new Modal(zoneItemsModalElement);

      const zoneItemsListElement = document.getElementById("zoneItemsList");
      zoneItemsListElement.innerHTML = "";
      zoneItemsListElement.dataset.zoneId = topHit.id;
      console.log("Top hit items:", topHit.items);

      this.#populateZoneItems(topHit.items, zoneItemsListElement);

      this.input.enabled = false;
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
    this.#furnitureInstance = data.furnitureInstance || null;
    console.log("Furniture instance ID:", this.#furnitureInstance);
  }

  /**
   * Creates the scene
   * @public
   */
  async create() {
    console.log("Scene", this);
    const backButton = document.createElement("button");
    backButton.id = "backButton";
    backButton.classList.add("btn", "btn-primary", "mr-2");
    backButton.textContent = "Back";

    document.getElementById("navbarButtons").appendChild(backButton);

    backButton.addEventListener("click", () => {
      this.scene.stop();
      this.scene.wake("FloorView");
      const backButtonElement = document.getElementById("backButton");
      if (backButtonElement) {
        backButtonElement.remove();
      }
    });

    const furnitureInstance = this.#furnitureInstance;
    if (furnitureInstance) {
      this.#loadFurniture(furnitureInstance);
    }

    const zoneItemsListElement = document.getElementById("zoneItemsList");
    Sortable.create(zoneItemsListElement, {
      group: "items",
      animation: 150,
      onAdd: (evt) => {
        console.log("Item added to zone:", evt);
        const item = evt.item;
        const id = item.dataset.id;
        const itemMap = this.scene.get("FloorView").itemMap;
        const itemData = itemMap.get(parseInt(id, 10));
        const previousList = evt.from;
        console.log("Event onAdd:", evt);
        if (previousList.id === "itemsMenuItems") {
          console.log("Item added from items menu:", itemData);
          const childList = document.createElement("ul");
          childList.classList.add("list-group");
          childList.dataset.parentId = parseInt(id, 10);
          item.appendChild(childList);

          this.#makeSortable(childList);

          if (itemData.children && itemData.children.size > 0) {
            this.#populateZoneItems(itemData.children, childList);
          }
        }

        const urlParams = new URLSearchParams(window.location.search);
        const floorId = parseInt(urlParams.get("floorId"), 10);
        const newZoneId = parseInt(zoneItemsListElement.dataset.zoneId, 10);
        itemData.changed = true;
        const previousZoneId = itemData.zoneId;
        itemData.zoneId = newZoneId;
        itemData.floorId = floorId;
        this.scene
          .get("FloorView")
          .moveItemBetweenZones(previousZoneId, newZoneId, parseInt(id, 10));
        console.log(this.#furnitureInstance);

        const oldParentId = itemData.parentId;
        if (oldParentId) {
          const oldParentItemData = itemMap.get(oldParentId);

          oldParentItemData.children.delete(parseInt(id, 10));
        }
        itemData.parentId = null;
        const updateChildrenFloor = (itemData, floorId) => {
          if (itemData.children && itemData.children.size > 0) {
            itemData.children.forEach((childId) => {
              const childItemData = itemMap.get(childId);
              childItemData.floorId = floorId;
              childItemData.changed = true;
              updateChildrenFloor(childItemData, floorId);
            });
          }
        };
        updateChildrenFloor(itemData, itemData.floorId);
      },
    });

    this.#addCanvasHoverHandler();

    const zoneItemsModalElement = document.getElementById("zoneItemsModal");
    this.#modalHiddenHandler = this.#handleModalHidden.bind(this);
    zoneItemsModalElement.addEventListener(
      "hidden.bs.modal",
      this.#modalHiddenHandler,
    );

    this.events.on("shutdown", () => {
      console.log("FurnitureView scene shutdown");
      this.game.canvas.removeEventListener(
        "dragover",
        this.#hoverCanvasHandler,
      );
      this.#hoverCanvasHandler = null;
      console.log("Canvas:", this.game.canvas);
      zoneItemsModalElement.removeEventListener(
        "hidden.bs.modal",
        this.#modalHiddenHandler,
      );
      this.#modalHiddenHandler = null;
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
