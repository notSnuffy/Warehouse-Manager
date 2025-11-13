import Phaser from "phaser";
import { Modal } from "bootstrap";
import Sortable from "sortablejs";
import PanningManager from "@managers/PanningManager";
import ShapeManager from "@managers/ShapeManager";
import CameraBoundsManager from "@managers/CameraBoundsManager";
import ScrollbarManager from "@managers/ScrollbarManager";
import UndoRedoManager from "@managers/UndoRedoManager";
import ZoomManager from "@managers/ZoomManager";
import ShapeInstructionsHandler from "@instructions/ShapeInstructionsHandler";
//import ShapeLabeler from "@managers/ShapeLabeler";
import * as Shapes from "@shapes";
import InstructionCommands from "@instructions/InstructionCommands.js";
import UndoRedoUserInterface from "@ui/UndoRedoUserInterface";

/**
 * Represents the furniture view scene
 * @class
 * @extends Phaser.Scene
 */
class FurnitureView extends Phaser.Scene {
  /**
   * Furniture instance of the furniture being viewed
   * @type {Object|null}
   */
  #furnitureInstance;

  /**
   * Last hovered item
   * @type {Phaser.GameObjects.GameObject|null}
   */
  #lastHover;

  /**
   * Timer for hover events
   * @type {Phaser.Time.TimerEvent|null}
   */
  #hoverTimer;

  /**
   * Handler for canvas hover events
   * @type {EventListener|null}
   */
  #hoverCanvasHandler;

  /**
   * Handler for modal hidden events
   * @type {Function|null}
   */
  #modalHiddenHandler;

  /**
   * Panning manager
   * @type {PanningManager}
   */
  #panningManager;

  /**
   * Shape manager
   * @type {ShapeManager}
   */
  #shapeManager;

  /**
   * Shape manager for placement zones in the furniture
   * @type {ShapeManager}
   */
  #zoneManager;

  /**
   * Camera bounds manager
   * @type {CameraBoundsManager}
   */
  #cameraBoundsManager;

  /**
   * Scrollbar manager
   * @type {ScrollbarManager}
   */
  #scrollbarManager;

  /**
   * Undo redo manager
   * @type {UndoRedoManager}
   */
  #undoRedoManager;

  /**
   * Shape instruction handler
   * @type {ShapeInstructionsHandler}
   */
  #shapeInstructionHandler;

  /**
   * Zone instruction handler
   * @type {ShapeInstructionsHandler}
   */
  #zoneInstructionHandler;

  /**
   * Shape labeler
   * @type {ShapeLabeler}
   */
  //  #labeler;

  /**
   * Object containing references to UI elements
   * @type {Object}
   * @property {UndoRedoUserInterface|null} undoRedoUI - The undo/redo UI
   */
  #UIElements;

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
   * @async
   */
  #loadFurniture(furnitureInstance) {
    const viewElementNameElement = document.getElementById("viewElementName");
    viewElementNameElement.textContent = furnitureInstance.furniture.name;

    if (furnitureInstance.furniture.shapes) {
      furnitureInstance.furniture.shapes.forEach(async (shapeData) => {
        const snapshots =
          await this.#shapeInstructionHandler.convertFromInstructions(
            shapeData.instructions,
            0xffffff,
          );

        const [shapeSnapshot] = snapshots;

        await this.#shapeManager.addShapeFromSnapshot(shapeSnapshot);
      });
    }

    const configureInteractive = (snapshots) => {
      snapshots.forEach((snapshot) => {
        const interactiveConfig = {};

        snapshot.additionalData = {
          interactive: interactiveConfig,
        };
      });
    };

    if (furnitureInstance.zoneInstances) {
      furnitureInstance.zoneInstances.forEach(async (zoneData) => {
        const zoneSnapshots =
          await this.#zoneInstructionHandler.convertFromInstructions(
            zoneData.zone.shape.instructions,
            0xeb7734,
          );
        configureInteractive(zoneSnapshots);
        const [zoneSnapshot] = zoneSnapshots;

        const zone = await this.#zoneManager.addShapeFromSnapshot(zoneSnapshot);
        zone.metadata.zoneId = zoneData.id;
        zone.items = zoneData.items || new Set();

        zone.on("pointerdown", () => {
          const zoneItemsModalElement =
            document.getElementById("zoneItemsModal");
          const zoneItemsModal = new Modal(zoneItemsModalElement);

          const zoneItemsListElement = document.getElementById("zoneItemsList");
          zoneItemsListElement.innerHTML = "";
          zoneItemsListElement.dataset.zoneId = zone.metadata.zoneId;

          this.#populateZoneItems(zone.items, zoneItemsListElement);

          this.input.enabled = false;
          zoneItemsModal.show();
        });
      });
    }
  }

  /**
   * Handler for modal hidden events
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
        const id = parseInt(item.dataset.id, 10);
        const itemMap = this.scene.get("FloorView").itemMap;
        const itemData = itemMap.get(id);
        const previousList = evt.from;
        console.log("Event onAdd:", evt);
        const thisList = evt.to;
        const newParentId = parseInt(thisList.dataset.parentId, 10);
        const newParentItemData = itemMap.get(newParentId);
        const oldParentId = itemData.parentId;
        let parentId = newParentId;
        while (parentId) {
          if (parentId === id) {
            alert("Cannot move an item into itself.");
            evt.to.removeChild(item);
            return;
          }
          const parentItemData = itemMap.get(parentId);
          parentId = parentItemData.parentId;
        }
        if (oldParentId) {
          const oldParentItemData = itemMap.get(oldParentId);

          oldParentItemData.children.delete(id);
        }
        newParentItemData.children.add(id);

        itemData.parentId = newParentId;
        itemData.changed = true;
        this.scene
          .get("FloorView")
          .moveItemBetweenZones(itemData.zoneId, null, id);
        itemData.zoneId = null;
        const previousFloorId = itemData.floorId;
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
        if (previousFloorId !== itemData.floorId) {
          updateChildrenFloor(itemData, itemData.floorId);
        }

        if (previousList.id === "itemsMenuItems") {
          console.log("Item added from items menu:", itemData);
          const childList = document.createElement("ul");
          childList.classList.add("list-group");
          childList.dataset.parentId = id;
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
      zoneItemsListElement.dataset.zoneId = topHit.metadata.zoneId;
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

    this.#lastHover = null;
    this.#hoverTimer = null;
    this.#hoverCanvasHandler = null;
    this.#modalHiddenHandler = null;
    this.#panningManager = null;
    this.#shapeManager = null;
    this.#zoneManager = null;
    this.#cameraBoundsManager = null;
    this.#scrollbarManager = null;
    this.#undoRedoManager = null;
    this.#shapeInstructionHandler = null;
    this.#zoneInstructionHandler = null;
    //   this.#labeler = null;
    this.#UIElements = {
      undoRedoUI: null,
    };
  }

  /**
   * Creates the scene
   * @public
   */
  async create() {
    console.log("Scene camera:", this.cameras.main);
    this.#undoRedoManager = new UndoRedoManager(this, 100);
    this.#shapeManager = new ShapeManager(this);
    this.#zoneManager = new ShapeManager(this);
    //  this.#labeler = new ShapeLabeler(this, false);

    this.#shapeInstructionHandler = new ShapeInstructionsHandler(
      this.#shapeManager,
    );
    this.#zoneInstructionHandler = new ShapeInstructionsHandler(
      this.#zoneManager,
    );
    this.#panningManager = new PanningManager(this);

    this.#panningManager.create();

    const zoomManager = new ZoomManager(this);
    zoomManager.create();

    const camera = this.cameras.main;

    const scrollXElement = document.getElementById("scrollX");
    const scrollYElement = document.getElementById("scrollY");

    const cameraWidth = camera.width;
    const cameraHeight = camera.height;

    const initialWorldWidth = cameraWidth * 3;
    const initialWorldHeight = cameraHeight * 3;

    this.#cameraBoundsManager = new CameraBoundsManager(this, camera, {
      worldWidth: initialWorldWidth,
      worldHeight: initialWorldHeight,
      eventConfig: {
        shapeAdded: { extraPadding: 0, allowShrink: false },
      },
    });
    this.#cameraBoundsManager.create();

    this.#scrollbarManager = new ScrollbarManager(
      this,
      camera,
      scrollXElement,
      scrollYElement,
      {
        worldWidth: initialWorldWidth,
        worldHeight: initialWorldHeight,
        eventNames: [
          "cameraZoomChanged",
          "cameraPanned",
          "cameraBoundsChanged",
        ],
      },
    );
    this.#scrollbarManager.create();

    this.#shapeManager.registerShape(
      "rectangle",
      (scene, params) => {
        const rectangle = new Shapes.Rectangle(
          scene,
          params.x,
          params.y,
          params.width,
          params.height,
          params.color,
        );
        rectangle.setRotation(params.rotation);

        return rectangle;
      },
      { command: InstructionCommands.CREATE_RECTANGLE },
    );
    this.#shapeManager.registerShape(
      "ellipse",
      (scene, params) => {
        const ellipse = new Shapes.Ellipse(
          scene,
          params.x,
          params.y,
          params.width,
          params.height,
          params.color,
        );
        ellipse.setRotation(params.rotation);
        return ellipse;
      },
      { command: InstructionCommands.CREATE_ELLIPSE },
    );
    this.#shapeManager.registerShape(
      "arc",
      (scene, params) => {
        const arc = new Shapes.Arc(
          scene,
          params.x,
          params.y,
          params.radius,
          params.startAngle,
          params.endAngle,
          false,
          params.color,
        );
        arc.setRotation(params.rotation);
        if (params.width && params.height) {
          arc.setDisplaySize(params.width, params.height);
        }
        return arc;
      },
      {
        command: InstructionCommands.CREATE_ARC,
        fieldMap: {
          radius: "arcRadius",
          startAngle: "arcStartAngle",
          endAngle: "arcEndAngle",
        },
      },
    );
    this.#shapeManager.registerShape(
      "polygon",
      (scene, params) => {
        const polygon = new Shapes.Polygon(
          scene,
          params.x,
          params.y,
          params.points,
          params.color,
        );
        polygon.setRotation(params.rotation);
        if (params.width && params.height) {
          polygon.setDisplaySize(params.width, params.height);
        }
        return polygon;
      },
      {
        command: InstructionCommands.CREATE_POLYGON,
        fieldMap: { points: "polygonPoints" },
      },
    );
    this.#shapeManager.registerShape(
      "container",
      async (scene, params) => {
        const children = [];
        if (params.children && params.children.length > 0) {
          for (const childSnapshot of params.children) {
            const childShape = await this.#shapeManager.addShapeFromSnapshot(
              childSnapshot,
              false,
            );

            if (!childShape) {
              continue;
            }
            children.push(childShape);
          }
        }

        const container = new Shapes.Container(
          scene,
          params.x,
          params.y,
          children,
        );
        container.setRotation(params.rotation);
        container.setSize(params.width, params.height);
        return container;
      },
      { command: InstructionCommands.BEGIN_CONTAINER, priority: 1 },
    );

    this.#zoneManager.registerShape(
      "rectangle",
      (scene, params) => {
        const rectangle = new Shapes.Rectangle(
          scene,
          params.x,
          params.y,
          params.width,
          params.height,
          params.color,
        );
        rectangle.setRotation(params.rotation);

        return rectangle;
      },
      { command: InstructionCommands.CREATE_RECTANGLE },
    );
    this.#zoneManager.registerShape(
      "ellipse",
      (scene, params) => {
        const ellipse = new Shapes.Ellipse(
          scene,
          params.x,
          params.y,
          params.width,
          params.height,
          params.color,
        );
        ellipse.setRotation(params.rotation);

        return ellipse;
      },
      { command: InstructionCommands.CREATE_ELLIPSE },
    );
    this.#zoneManager.registerShape(
      "arc",
      (scene, params) => {
        const arc = new Shapes.Arc(
          scene,
          params.x,
          params.y,
          params.radius,
          params.startAngle,
          params.endAngle,
          false,
          params.color,
        );
        arc.setRotation(params.rotation);

        if (params.width && params.height) {
          arc.setDisplaySize(params.width, params.height);
        }

        return arc;
      },
      {
        command: InstructionCommands.CREATE_ARC,
        fieldMap: {
          radius: "arcRadius",
          startAngle: "arcStartAngle",
          endAngle: "arcEndAngle",
        },
      },
    );
    this.#zoneManager.registerShape(
      "polygon",
      (scene, params) => {
        const polygon = new Shapes.Polygon(
          scene,
          params.x,
          params.y,
          params.points,
          params.color,
        );
        polygon.setRotation(params.rotation);
        if (params.width && params.height) {
          polygon.setDisplaySize(params.width, params.height);
        }

        return polygon;
      },
      {
        command: InstructionCommands.CREATE_POLYGON,
        fieldMap: { points: "polygonPoints" },
      },
    );
    this.#zoneManager.registerShape(
      "container",
      async (scene, params) => {
        const children = [];
        if (params.children && params.children.length > 0) {
          for (const childSnapshot of params.children) {
            const childShape = await this.#zoneManager.addShapeFromSnapshot(
              childSnapshot,
              false,
            );

            if (!childShape) {
              continue;
            }
            children.push(childShape);
          }
        }

        const container = new Shapes.Container(
          scene,
          params.x,
          params.y,
          children,
        );
        container.setRotation(params.rotation);
        container.setSize(params.width, params.height);

        return container;
      },
      { command: InstructionCommands.BEGIN_CONTAINER, priority: 1 },
    );

    this.#UIElements.undoRedoUI = new UndoRedoUserInterface(
      this,
      this.#undoRedoManager,
      "undoButton",
      "redoButton",
    );

    console.log("Scene", this);
    const backButton = document.createElement("button");
    backButton.id = "backButton";
    backButton.classList.add("btn", "btn-primary", "mr-2");
    backButton.textContent = "Back";

    const navbarButtonsElement = document.getElementById("navbarButtons");
    navbarButtonsElement.insertBefore(
      backButton,
      navbarButtonsElement.firstChild,
    );

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
        const id = parseInt(item.dataset.id, 10);
        const itemMap = this.scene.get("FloorView").itemMap;
        const itemData = itemMap.get(id);
        const previousList = evt.from;
        console.log("Event onAdd:", evt);
        if (previousList.id === "itemsMenuItems") {
          console.log("Item added from items menu:", itemData);
          const childList = document.createElement("ul");
          childList.classList.add("list-group");
          childList.dataset.parentId = id;
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
        const previousFloorId = itemData.floorId;
        itemData.floorId = floorId;
        this.scene
          .get("FloorView")
          .moveItemBetweenZones(previousZoneId, newZoneId, id);
        console.log(this.#furnitureInstance);

        const oldParentId = itemData.parentId;
        if (oldParentId) {
          const oldParentItemData = itemMap.get(oldParentId);

          oldParentItemData.children.delete(id);
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
        if (previousFloorId !== floorId) {
          updateChildrenFloor(itemData, itemData.floorId);
        }
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
      this.#shapeManager.clearAllShapes();
      this.#zoneManager.clearAllShapes();
      this.#cameraBoundsManager.destroy();
    });
    console.log(this.#cameraBoundsManager);
    console.log(this.#shapeManager);
  }

  /**
   * Updates the scene
   * @public
   */
  update() {
    this.#panningManager.update();
  }
}

export { FurnitureView };
