import Phaser from "phaser";
import { Modal } from "bootstrap";
import PanningManager from "@managers/PanningManager";
import ShapeManager from "@managers/ShapeManager";
import CameraBoundsManager from "@managers/CameraBoundsManager";
import ScrollbarManager from "@managers/ScrollbarManager";
import ZoomManager from "@managers/ZoomManager";
import ShapeInstructionsHandler from "@instructions/ShapeInstructionsHandler";
import ShapeLabeler from "@managers/ShapeLabeler";
import * as Shapes from "@shapes";
import InstructionCommands from "@instructions/InstructionCommands.js";

/**
 * Scene that highlights the location of furniture items within a furniture layout
 * @class
 * @extends Phaser.Scene
 */
class FurnitureItemLocation extends Phaser.Scene {
  /**
   * Furniture instance of the furniture being viewed
   * @type {Object|null}
   */
  #furnitureInstance;

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
   * Constructor for the FurnitureItemLocation scene
   * @constructor
   */
  constructor() {
    super("FurnitureItemLocation");
  }

  /**
   * Loads the furniture instance
   * @param {Object} furnitureInstance - The furniture instance to load
   * @async
   */
  #loadFurniture(furnitureInstance) {
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
            zoneData.isHighlighted ? 0xff0000 : 0xeb7734,
          );
        configureInteractive(zoneSnapshots);
        const [zoneSnapshot] = zoneSnapshots;

        const zone = await this.#zoneManager.addShapeFromSnapshot(zoneSnapshot);
        zone.items = zoneData.items;

        zone.on("pointerdown", () => {
          const zoneItemsModalElement =
            document.getElementById("zoneItemsModal");
          const zoneItemsModal = new Modal(zoneItemsModalElement);

          const zoneItemsListElement = document.getElementById("zoneItemsList");
          zoneItemsListElement.innerHTML = "";

          console.log("Zone items:", zone.items);
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
    this.input.enabled = true;
  }

  /**
   * Populates zone items into a given unordered list element
   * @param {Array} items - Set of item ids with which to populate the list
   * @param {HTMLElement} unorderedListElement - The unordered list element to populate
   * @return {void}
   */
  #populateZoneItems(items, unorderedListElement) {
    console.log("Populating zone items:", items);
    items.forEach((item) => {
      console.log("Processing item:", item);
      const itemElement = document.createElement("li");
      itemElement.textContent = `${item.name}`;
      itemElement.classList.add("list-group-item");

      if (item.isHighlighted) {
        itemElement.classList.add("list-group-item-danger");
      }

      const childList = document.createElement("ul");
      childList.classList.add("list-group");
      unorderedListElement.appendChild(itemElement);

      itemElement.appendChild(childList);

      if (item.children && item.children.length > 0) {
        console.log("Populating children for item:", item.name, item.children);
        this.#populateZoneItems(item.children, childList);
      }
    });
  }

  /**
   * Initializes the scene
   * @param {Object} data - Data passed to the scene
   * @public
   */
  init(data) {
    this.#furnitureInstance = data.furnitureInstance || null;
    console.log("Furniture instance ID:", this.#furnitureInstance);

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
      this.scene.wake("FloorItemLocation");
      const backButtonElement = document.getElementById("backButton");
      if (backButtonElement) {
        backButtonElement.remove();
      }
    });

    const furnitureInstance = this.#furnitureInstance;
    if (furnitureInstance) {
      this.#loadFurniture(furnitureInstance);
    }

    const zoneItemsModalElement = document.getElementById("zoneItemsModal");
    this.#modalHiddenHandler = this.#handleModalHidden.bind(this);
    zoneItemsModalElement.addEventListener(
      "hidden.bs.modal",
      this.#modalHiddenHandler,
    );

    this.events.once("shutdown", () => {
      zoneItemsModalElement.removeEventListener(
        "hidden.bs.modal",
        this.#modalHiddenHandler,
      );
      this.#modalHiddenHandler = null;
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

export { FurnitureItemLocation };
