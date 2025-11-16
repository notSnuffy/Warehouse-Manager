import Phaser from "phaser";
import { Modal } from "bootstrap";
import Sortable from "sortablejs";
import PanningManager from "@managers/PanningManager";
import ShapeManager from "@managers/ShapeManager";
import CameraBoundsManager from "@managers/CameraBoundsManager";
import ScrollbarManager from "@managers/ScrollbarManager";
import ZoomManager from "@managers/ZoomManager";
import ShapeInstructionsHandler from "@instructions/ShapeInstructionsHandler";
import ShapeLabeler from "@managers/ShapeLabeler";
import * as Shapes from "@shapes";
import InstructionCommands from "@instructions/InstructionCommands.js";
import CompositeCommand from "@commands/CompositeCommand";

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
  #labeler;

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

        this.#labeler.addLabel(zone, zoneData.zone.name, "#ffffff", () => {});
      });
    }
  }

  /**
   * Handler for modal hidden events
   * @return {void}
   */
  #handleModalHidden() {
    if (this.#hoverTimer) {
      this.#hoverTimer.remove();
      this.#hoverTimer = null;
    }
    this.#lastHover = null;
    this.input.enabled = true;
  }

  /**
   * Updates the floor ID of an item and its children
   * @param {Object} itemData - The item data to update
   * @param {number} floorId - The new floor ID
   * @param {Map} itemMap - Map of item IDs to item data
   * @param {CompositeCommand} childCompositeCommand - Composite command to record child updates
   * @return {void}
   */
  #updateChildrenFloor = (
    itemData,
    floorId,
    itemMap,
    childCompositeCommand,
  ) => {
    if (itemData.children && itemData.children.size > 0) {
      itemData.children.forEach((childId) => {
        const childItemData = itemMap.get(childId);

        const previousChildItemData = { ...childItemData };
        childCompositeCommand.addCommand({
          execute: async () => {
            childItemData.floorId = floorId;
            childItemData.changed = true;
          },
          undo: async () => {
            childItemData.floorId = previousChildItemData.floorId;
            childItemData.changed = true;
          },
        });

        this.#updateChildrenFloor(
          childItemData,
          floorId,
          itemMap,
          childCompositeCommand,
        );
      });
    }
  };

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

        const compositeCommand = new CompositeCommand();

        if (oldParentId) {
          const oldParentItemData = itemMap.get(oldParentId);

          //oldParentItemData.children.delete(id);
          compositeCommand.addCommand({
            execute: async () => {
              oldParentItemData.children.delete(id);
            },
            undo: async () => {
              oldParentItemData.children.add(id);
            },
          });
        }
        //newParentItemData.children.add(id);
        compositeCommand.addCommand({
          execute: async () => {
            newParentItemData.children.add(id);
          },
          undo: async () => {
            newParentItemData.children.delete(id);
          },
        });

        const previousItemData = { ...itemData };
        const floorView = this.scene.get("FloorView");

        compositeCommand.addCommand({
          execute: async () => {
            itemData.parentId = newParentId;
            itemData.changed = true;
            floorView.moveItemBetweenZones(itemData.zoneId, null, id);
            itemData.zoneId = null;
            itemData.floorId = newParentItemData.floorId;
            console.log("Item data after move:", itemData);
          },
          undo: async () => {
            itemData.parentId = previousItemData.parentId;
            itemData.zoneId = previousItemData.zoneId;
            itemData.floorId = previousItemData.floorId;
            itemData.changed = true;
            floorView.moveItemBetweenZones(null, itemData.zoneId, id);
          },
        });

        if (previousItemData.floorId !== newParentItemData.floorId) {
          const childCompositeCommand = new CompositeCommand();
          this.#updateChildrenFloor(
            itemData,
            itemData.floorId,
            itemMap,
            childCompositeCommand,
          );
          compositeCommand.addCommand(childCompositeCommand);
        }

        if (previousList.id === "itemsMenuItems") {
          console.log("Item added from items menu:", itemData);
          const childList = document.createElement("ul");
          childList.classList.add("list-group");
          childList.dataset.parentId = id;
          this.#addRemoveButtonToItemElement(item);

          item.appendChild(childList);

          this.#makeSortable(childList);

          if (itemData.children && itemData.children.size > 0) {
            this.#populateZoneItems(itemData.children, childList);
          }
        }

        compositeCommand.execute();
        const index = evt.newIndex;
        compositeCommand.addCommand({
          execute: async () => {
            const thisList = document.querySelector(
              `ul[data-parent-id="${newParentId}"]`,
            );
            if (!thisList) {
              return;
            }
            thisList.insertBefore(item, thisList.children[index] || null);
          },
          undo: async () => {
            const thisList = document.querySelector(
              `ul[data-parent-id="${newParentId}"]`,
            );

            if (thisList) {
              const item = thisList.querySelector(`li[data-id="${id}"]`);
              thisList.removeChild(item);
            }
            const previousListSelector = previousItemData.parentId
              ? `ul[data-parent-id="${previousItemData.parentId}"]`
              : `ul[data-zone-id="${previousItemData.zoneId}"]`;
            const previousListElement =
              document.querySelector(previousListSelector);
            if (!previousListElement) {
              return;
            }
            previousListElement.insertBefore(
              item,
              previousListElement.children[evt.oldIndex] || null,
            );
          },
        });

        floorView.undoRedoManager.pushCommand(compositeCommand);
      },
    });
  }

  /**
   * Adds a remove button to an item element
   * @param {HTMLElement} itemElement - The item element to add the remove button to
   * @return {void}
   */
  #addRemoveButtonToItemElement(itemElement) {
    const removeButton = document.createElement("button");
    removeButton.classList.add("btn", "btn-sm", "btn-danger");
    removeButton.textContent = "Remove";

    const contentWrapper = document.createElement("div");
    contentWrapper.classList.add(
      "d-flex",
      "justify-content-between",
      "align-items-center",
      "mb-1",
    );

    const itemText = document.createElement("span");
    itemText.textContent = itemElement.textContent;
    contentWrapper.appendChild(itemText);
    contentWrapper.appendChild(removeButton);
    itemElement.textContent = "";
    itemElement.appendChild(contentWrapper);

    removeButton.addEventListener("click", (e) => {
      e.stopPropagation();

      const itemId = parseInt(itemElement.dataset.id, 10);

      const floorView = this.scene.get("FloorView");
      const itemMap = floorView.itemMap;
      const itemData = itemMap.get(itemId);

      const previousItemData = { ...itemData };

      const compositeCommand = new CompositeCommand();
      const previousIndex = Array.from(
        itemElement.parentElement.children,
      ).indexOf(itemElement);

      compositeCommand.addCommand({
        execute: async () => {
          const elementSelector = itemData.parentId
            ? `ul[data-parent-id="${itemData.parentId}"]`
            : `ul[data-zone-id="${itemData.zoneId}"]`;
          const parentList = document.querySelector(elementSelector);

          if (!parentList) {
            return;
          }

          const itemElement = parentList.querySelector(
            `li[data-id="${itemId}"]`,
          );
          parentList.removeChild(itemElement);
        },
        undo: async () => {
          const elementSelector = previousItemData.parentId
            ? `ul[data-parent-id="${previousItemData.parentId}"]`
            : `ul[data-zone-id="${previousItemData.zoneId}"]`;
          const parentList = document.querySelector(elementSelector);

          if (!parentList) {
            return;
          }

          parentList.insertBefore(
            itemElement,
            parentList.children[previousIndex] || null,
          );
        },
      });

      if (itemData.parentId) {
        const parentItemData = itemMap.get(itemData.parentId);
        //parentItemData.children.delete(itemId);
        compositeCommand.addCommand({
          execute: async () => {
            parentItemData.children.delete(itemId);
          },
          undo: async () => {
            parentItemData.children.add(itemId);
          },
        });
      }

      compositeCommand.addCommand({
        execute: async () => {
          itemData.zoneId = null;
          itemData.parentId = null;
          itemData.changed = true;
          itemData.floorId = null;
          floorView.moveItemBetweenZones(previousItemData.zoneId, null, itemId);
        },
        undo: async () => {
          itemData.zoneId = previousItemData.zoneId;
          itemData.parentId = previousItemData.parentId;
          itemData.changed = true;
          itemData.floorId = previousItemData.floorId;
          floorView.moveItemBetweenZones(null, itemData.zoneId, itemId);
        },
      });

      const childCompositeCommand = new CompositeCommand();
      const resetChildren = (itemData) => {
        if (itemData.children && itemData.children.size > 0) {
          itemData.children.forEach((childId) => {
            const childItemData = itemMap.get(childId);
            const previousChildItemData = { ...childItemData };

            childCompositeCommand.addCommand({
              execute: async () => {
                childItemData.floorId = null;
                childItemData.changed = true;
              },
              undo: async () => {
                childItemData.floorId = previousChildItemData.floorId;
                childItemData.changed = true;
              },
            });

            resetChildren(childItemData);
          });
        }
      };
      resetChildren(itemData);

      compositeCommand.addCommand(childCompositeCommand);
      compositeCommand.execute();
      floorView.undoRedoManager.pushCommand(compositeCommand);
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
      unorderedListElement.appendChild(itemElement);
      this.#addRemoveButtonToItemElement(itemElement);

      itemElement.appendChild(childList);

      this.#makeSortable(childList);

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
    this.#shapeInstructionHandler = null;
    this.#zoneInstructionHandler = null;
    this.#labeler = null;
  }

  /**
   * Creates the scene
   * @public
   */
  async create() {
    console.log("Scene camera:", this.cameras.main);
    const undoRedoManager = this.scene.get("FloorView").undoRedoManager;
    this.input.keyboard.on("keydown-Z", async (event) => {
      if (event.ctrlKey) {
        await undoRedoManager.undo();
      }
    });
    this.input.keyboard.on("keydown-Y", async (event) => {
      if (event.ctrlKey) {
        await undoRedoManager.redo();
      }
    });
    this.#shapeManager = new ShapeManager(this);
    this.#zoneManager = new ShapeManager(this);
    this.#labeler = new ShapeLabeler(this, false);

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

        const floorView = this.scene.get("FloorView");
        const itemMap = floorView.itemMap;
        const itemData = itemMap.get(id);
        const previousList = evt.from;

        const compositeCommand = new CompositeCommand();

        if (previousList.id === "itemsMenuItems") {
          const childList = document.createElement("ul");
          childList.classList.add("list-group");
          childList.dataset.parentId = id;
          this.#addRemoveButtonToItemElement(item);

          item.appendChild(childList);

          this.#makeSortable(childList);

          if (itemData.children && itemData.children.size > 0) {
            this.#populateZoneItems(itemData.children, childList);
          }
        }

        const urlParams = new URLSearchParams(window.location.search);
        const floorId = parseInt(urlParams.get("floorId"), 10);
        const newZoneId = parseInt(zoneItemsListElement.dataset.zoneId, 10);

        const previousItemData = { ...itemData };

        compositeCommand.addCommand({
          execute: async () => {
            itemData.changed = true;
            itemData.zoneId = newZoneId;
            itemData.floorId = floorId;
            itemData.parentId = null;
            floorView.moveItemBetweenZones(
              previousItemData.zoneId,
              newZoneId,
              id,
            );
          },
          undo: async () => {
            itemData.zoneId = previousItemData.zoneId;
            itemData.floorId = previousItemData.floorId;
            itemData.changed = true;
            itemData.parentId = previousItemData.parentId;
            floorView.moveItemBetweenZones(
              newZoneId,
              previousItemData.zoneId,
              id,
            );
          },
        });

        const oldParentId = itemData.parentId;
        if (oldParentId) {
          const oldParentItemData = itemMap.get(oldParentId);

          compositeCommand.addCommand({
            execute: async () => {
              oldParentItemData.children.delete(id);
            },
            undo: async () => {
              oldParentItemData.children.add(id);
            },
          });
        }

        if (previousItemData.floorId !== floorId) {
          const childCompositeCommand = new CompositeCommand();
          this.#updateChildrenFloor(
            itemData,
            itemData.floorId,
            itemMap,
            childCompositeCommand,
          );
          compositeCommand.addCommand(childCompositeCommand);
        }

        compositeCommand.execute();
        const index = evt.newIndex;
        compositeCommand.addCommand({
          execute: async () => {
            const thisListSelector = `ul[data-zone-id="${newZoneId}"]`;
            const thisList = document.querySelector(thisListSelector);
            if (!thisList) {
              return;
            }

            thisList.insertBefore(item, thisList.children[index] || null);
          },
          undo: async () => {
            const thisListSelector = `ul[data-zone-id="${newZoneId}"]`;
            const thisList = document.querySelector(thisListSelector);

            if (thisList) {
              const item = thisList.querySelector(`li[data-id="${id}"]`);
              thisList.removeChild(item);
            }

            const previousListSelector = previousItemData.parentId
              ? `ul[data-parent-id="${previousItemData.parentId}"]`
              : `ul[data-zone-id="${previousItemData.zoneId}"]`;
            const previousListElement =
              document.querySelector(previousListSelector);
            if (!previousListElement) {
              return;
            }
            previousListElement.insertBefore(
              item,
              previousListElement.children[evt.oldIndex] || null,
            );
          },
        });
        floorView.undoRedoManager.pushCommand(compositeCommand);
      },
    });

    this.#addCanvasHoverHandler();

    const zoneItemsModalElement = document.getElementById("zoneItemsModal");
    this.#modalHiddenHandler = this.#handleModalHidden.bind(this);
    zoneItemsModalElement.addEventListener(
      "hidden.bs.modal",
      this.#modalHiddenHandler,
    );

    this.events.once("shutdown", () => {
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
      //this.#shapeManager.clearAllShapes();
      //this.#zoneManager.clearAllShapes();
      //this.#cameraBoundsManager.destroy();
      this.#scrollbarManager.destroy();
    });
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
