import { populateFloorViewItemList } from "@utils/UIHelperFunctions";
import { FurnitureView } from "@scenes/FurnitureView";
import { API_URL } from "@/config";
import Phaser from "phaser";
import PanningManager from "@managers/PanningManager";
import ShapeManager from "@managers/ShapeManager";
import CameraBoundsManager from "@managers/CameraBoundsManager";
import ScrollbarManager from "@managers/ScrollbarManager";
import UndoRedoManager from "@managers/UndoRedoManager";
import ZoomManager from "@managers/ZoomManager";
import * as Shapes from "@shapes";
import InstructionCommands from "@instructions/InstructionCommands";
import UndoRedoUserInterface from "@ui/UndoRedoUserInterface";
import ShapeInstructionsHandler from "@instructions/ShapeInstructionsHandler";
import ShapeLabeler from "@managers/ShapeLabeler";

class FloorView extends Phaser.Scene {
  /**
   * Map of furniture instances by their IDs
   * @type {Map<string, Object>}
   * @default new Map()
   */
  #furnitureInstances = new Map();

  /**
   * If item is being dragged
   * @type {boolean}
   * @default false
   */
  #isDragging = false;

  /**
   * Panning manager
   * @type {PanningManager}
   * @default null
   */
  #panningManager = null;

  /**
   * Furniture manager
   * @type {ShapeManager}
   * @default null
   */
  #furnitureManager = null;

  /**
   * Corner manager
   * @type {ShapeManager}
   * @default null
   */
  #cornerManager = null;

  /**
   * Wall manager
   * @type {ShapeManager}
   * @default null
   */
  #wallManager = null;

  /**
   * Camera bounds manager
   * @type {CameraBoundsManager}
   * @default null
   */
  #cameraBoundsManager = null;

  /**
   * Scrollbar manager
   * @type {ScrollbarManager}
   * @default null
   */
  #scrollbarManager = null;

  /**
   * Undo redo manager
   * @type {UndoRedoManager}
   * @default null
   */
  #undoRedoManager = null;

  /**
   * Furniture instructions handler
   * @type {ShapeInstructionsHandler}
   * @default null
   */
  #furnitureInstructionsHandler = null;

  /**
   * Furniture labeler
   * @type {ShapeLabeler}
   * @default null
   */
  #labeler = null;

  /**
   * Object containing references to UI elements
   * @type {Object}
   * @property {LabeledModalUserInterface|null} furnitureModal - The furniture modal UI
   * @property {UndoRedoUserInterface|null} undoRedoUI - The undo/redo UI
   * @property {FurnitureListUserInterface|null} furnitureListUI - The furniture list UI
   * @property {FloorSaveButtonUserInterface|null} saveButton - The floor save button UI
   * @default { furnitureModal: null, undoRedoUI: null, furnitureListUI: null, saveButton: null}
   */
  #UIElements = {
    furnitureModal: null,
    undoRedoUI: null,
    furnitureListUI: null,
    saveButton: null,
  };

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
   * @default null
   */
  #lastHover = null;

  /**
   * Timer for hover events
   * @type {Phaser.Time.TimerEvent|null}
   * @default null
   */
  #hoverTimer = null;

  /**
   * Handler for canvas hover events
   * @type {Function|null}
   * @default null
   */
  #hoverCanvasHandler = null;

  /**
   * Map of items in the item list
   * @type {Map<string, Object>|null}
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
        if (zoneInstance.id === previousZoneId) {
          if (!zoneInstance.items.has(itemId)) {
            console.warn(`Item ${itemId} not found in zone ${previousZoneId}`);
            return;
          }
          zoneInstance.items.delete(itemId);
        }
        if (zoneInstance.id === newZoneId) {
          zoneInstance.items.add(itemId);
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
   * Loads the floor data from the API
   * @param {string} floorId - The ID of the floor to load
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
   * @async
   */
  async #loadFloor(floorId) {
    const floorData = await this.#loadFloorData(floorId);

    const cornerMap = new Map();

    const viewElementNameElement = document.getElementById("viewElementName");
    viewElementNameElement.textContent = `${floorData.name}`;

    for (const cornerData of floorData.corners) {
      const corner = await this.#cornerManager.addShape("corner", {
        x: cornerData.positionX,
        y: cornerData.positionY,
      });

      cornerMap.set(cornerData.id, corner);
    }

    floorData.walls.forEach((wallData) => {
      const startCorner = cornerMap.get(wallData.startCornerId);
      const endCorner = cornerMap.get(wallData.endCornerId);
      if (startCorner && endCorner) {
        const params = {
          corner1: startCorner,
          corner2: endCorner,
        };

        this.#wallManager.addShape("wall", params, {}, false);
      } else {
        console.warn("Invalid corners for wall:", wallData);
      }
    });
    floorData.furniture.forEach(async (furnitureData) => {
      const furnitureInstructions =
        furnitureData.topDownViewInstance.instructions;
      const name = furnitureData.furniture.name;
      const furnitureInstanceId = furnitureData.id;

      if (!furnitureInstructions) {
        return;
      }

      if (
        !Array.isArray(furnitureInstructions) ||
        furnitureInstructions.length === 0
      ) {
        return;
      }

      const configureInteractive = (snapshots) => {
        snapshots.forEach((snapshot) => {
          const interactiveConfig = {};

          snapshot.additionalData = {
            interactive: interactiveConfig,
          };
        });
      };

      const snapshots =
        await this.#furnitureInstructionsHandler.convertFromInstructions(
          furnitureInstructions,
          0xffffff,
        );
      configureInteractive(snapshots);
      const [furnitureSnapshot] = snapshots;

      furnitureSnapshot.metadata.furnitureInstanceId = furnitureInstanceId;
      const furniture =
        await this.#furnitureManager.addShapeFromSnapshot(furnitureSnapshot);

      furniture.on("pointerdown", () => {
        this.scene.sleep();
        this.scene.launch("FurnitureView", {
          furnitureInstance: this.#furnitureInstances.get(furnitureInstanceId),
        });
        this.scene.bringToTop("FurnitureView");
      });

      this.#labeler.addLabel(furniture, name, "#ffffff", () => {});

      furnitureData.zoneInstances.forEach((zoneInstance) => {
        const itemSet = new Set();
        Object.values(zoneInstance.items).forEach((item) => {
          itemSet.add(item.id);
        });
        zoneInstance.items = itemSet;
      });

      this.#furnitureInstances.set(furnitureInstanceId, furnitureData);
    });
  }

  /**
   * Handles the dragover event on the canvas
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
    const worldPoint = this.cameras.main.getWorldPoint(
      canvasPointerX,
      canvasPointerY,
    );
    pointer.x = worldPoint.x;
    pointer.y = worldPoint.y;

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
          topHit.metadata.furnitureInstanceId,
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
    this.#undoRedoManager = new UndoRedoManager(this, 100);

    this.#furnitureManager = new ShapeManager(this);
    this.#cornerManager = new ShapeManager(this);
    this.#wallManager = new ShapeManager(this);

    this.#labeler = new ShapeLabeler(this, false);

    this.#furnitureInstructionsHandler = new ShapeInstructionsHandler(
      this.#furnitureManager,
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

    this.#furnitureManager.registerShape(
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
      {
        command: InstructionCommands.CREATE_RECTANGLE,
      },
    );
    this.#furnitureManager.registerShape(
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
      {
        command: InstructionCommands.CREATE_ELLIPSE,
      },
    );
    this.#furnitureManager.registerShape(
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
    this.#furnitureManager.registerShape(
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
    this.#furnitureManager.registerShape(
      "container",
      async (scene, params) => {
        const children = [];
        if (params.children && params.children.length > 0) {
          for (const childSnapshot of params.children) {
            const childShape =
              await this.#furnitureManager.addShapeFromSnapshot(
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
      {
        command: InstructionCommands.BEGIN_CONTAINER,
      },
    );

    this.#cornerManager.registerShape("corner", (scene, params) => {
      const corner = new Shapes.Arc(
        scene,
        params.x,
        params.y,
        20,
        0,
        360,
        false,
        0xffffff,
      );

      return corner;
    });

    this.#wallManager.registerShape("wall", (scene, params) => {
      const { corner1, corner2 } = params;

      const wall = scene.add
        .line(0, 0, corner1.x, corner1.y, corner2.x, corner2.y, 0xffffff)
        .setOrigin(0, 0)
        .setLineWidth(10);

      return wall;
    });

    this.#UIElements.undoRedoUI = new UndoRedoUserInterface(
      this,
      this.#undoRedoManager,
      "undoButton",
      "redoButton",
    );

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
          newParentId: item.parentId,
          newZoneId: item.zoneId,
          newFloorId: item.floorId,
        });
        item.changed = false;
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
      this.scene.get("FurnitureView").events.once("destroy", () => {
        this.scene.add("FurnitureView", FurnitureView);
      });
      this.scene.remove(this.scene.get("FurnitureView"));
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

export default FloorView;
