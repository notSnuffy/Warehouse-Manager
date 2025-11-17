import { FurnitureItemLocation } from "@scenes/FurnitureItemLocation";
import { API_URL } from "@/config";
import Phaser from "phaser";
import PanningManager from "@managers/PanningManager";
import ShapeManager from "@managers/ShapeManager";
import CameraBoundsManager from "@managers/CameraBoundsManager";
import ScrollbarManager from "@managers/ScrollbarManager";
import ZoomManager from "@managers/ZoomManager";
import * as Shapes from "@shapes";
import InstructionCommands from "@instructions/InstructionCommands";
import ShapeInstructionsHandler from "@instructions/ShapeInstructionsHandler";
import ShapeLabeler from "@managers/ShapeLabeler";

/**
 * Scene for displaying floor item location
 * @class FloorItemLocation
 * @extends {Phaser.Scene}
 */
class FloorItemLocation extends Phaser.Scene {
  /**
   * Map of furniture instances by their IDs
   * @type {Map<string, Object>}
   * @default new Map()
   */
  #furnitureInstances = new Map();

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
   * Constructor for the FloorItemLocation scene
   * @constructor
   */
  constructor() {
    super("FloorItemLocation");
  }

  /**
   * Initializes the scene
   * @public
   */
  init() {}

  /**
   * Loads the item data from the API
   * @param {string} itemId - The ID of the item to load
   * @returns {Promise<Object>} - The item data
   * @throws {Error} - If the fetch fails or the response is not ok
   * @async
   */
  async #loadItemData(itemId) {
    try {
      const response = await fetch(
        `${API_URL}/item-management/items/${itemId}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch item data.");
      }
      const itemData = await response.json();
      console.log("Item data fetched successfully:", itemData);
      return itemData;
    } catch (error) {
      console.error("Error fetching item data:", error);
      alert("Failed to load item data. Please check the console for details.");
    }
  }

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
   * @param {Object} highlightedItem - The item to highlight
   * @async
   */
  async #loadFloor(floorId, highlightedItem) {
    const floorData = await this.#loadFloorData(floorId);

    const cornerMap = new Map();

    const itemNameElement = document.getElementById("itemName");
    itemNameElement.textContent = `${floorData.name}`;

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

      const highlightPath = (path) => {
        path.forEach((item) => {
          item.isHighlighted = true;
        });
      };

      const findItem = (item, path = []) => {
        if (item.id === highlightedItem.id) {
          return { item, path };
        }

        if (!item.children || item.children.length === 0) {
          return null;
        }

        for (const childItem of item.children) {
          const foundItem = findItem(childItem, [...path, item]);
          if (foundItem) {
            return foundItem;
          }
        }
        return null;
      };

      let isHighlighted = false;

      for (const zoneInstance of furnitureData.zoneInstances) {
        zoneInstance.items = Object.values(zoneInstance.items || []);
        let item = null;

        for (const zoneItem of zoneInstance.items) {
          item = findItem(zoneItem);
          if (item) {
            break;
          }
        }

        if (!item) {
          continue;
        }

        isHighlighted = true;
        zoneInstance.isHighlighted = true;
        highlightPath(item.path);
        item.item.isHighlighted = true;
      }

      const snapshots =
        await this.#furnitureInstructionsHandler.convertFromInstructions(
          furnitureInstructions,
          isHighlighted ? 0xff0000 : 0xffffff,
        );
      configureInteractive(snapshots);
      const [furnitureSnapshot] = snapshots;

      furnitureSnapshot.metadata.furnitureInstanceId = furnitureInstanceId;
      const furniture =
        await this.#furnitureManager.addShapeFromSnapshot(furnitureSnapshot);

      furniture.on("pointerdown", () => {
        this.scene.sleep();
        this.scene.launch("FurnitureItemLocation", {
          furnitureInstance: this.#furnitureInstances.get(furnitureInstanceId),
        });
        this.scene.bringToTop("FurnitureItemLocation");
      });

      this.#labeler.addLabel(furniture, name, "#ffffff", () => {});

      this.#furnitureInstances.set(furnitureInstanceId, furnitureData);
    });
  }

  /**
   * Creates the scene
   * @public
   */
  async create() {
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

    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get("itemId");
    if (itemId) {
      const itemData = await this.#loadItemData(itemId);
      console.log("Loaded item data:", itemData);
      if (itemData && itemData.floorId) {
        await this.#loadFloor(itemData.floorId, itemData);
      }
    }

    this.events.on("wake", () => {
      this.#scrollbarManager.resetScrollbarsToInitialPosition();

      this.scene.get("FurnitureItemLocation").events.once("destroy", () => {
        this.scene.add("FurnitureItemLocation", FurnitureItemLocation);
      });
      this.scene.remove(this.scene.get("FurnitureItemLocation"));
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

export default FloorItemLocation;
