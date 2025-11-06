import Phaser from "phaser";
import { API_URL } from "@/config";
import MoveManager from "@managers/move/MoveManager";
import SelectShapeManager from "@managers/select/SelectShapeManager";
import PanningManager from "@managers/PanningManager";
import ShapeManager from "@managers/ShapeManager";
import CameraBoundsManager from "@managers/CameraBoundsManager";
import ScrollbarManager from "@managers/ScrollbarManager";
import UndoRedoManager from "@managers/UndoRedoManager";
import OutlineManager from "@managers/outlines/OutlineManager";
import ZoomManager from "@managers/ZoomManager";
import CreateCommandEventHandler from "@managers/CreateCommandEventHandler";
import LabeledCreateCommandEventHandler from "@managers/LabeledCreateCommandEventHandler";
import ShapeInstructionsHandler from "@instructions/ShapeInstructionsHandler";
import ShapeLabeler from "@managers/ShapeLabeler";
import * as Shapes from "@shapes";
import InstructionCommands from "@instructions/InstructionCommands.js";
import ShapeModalUserInterface from "@ui/ShapeModalUserInterface";
import LabeledShapeModalUserInterface from "@ui/LabeledShapeModalUserInterface";
import UndoRedoUserInterface from "@ui/UndoRedoUserInterface";
import ShapeListUserInterface from "@ui/ShapeListUserInterface";
import FurnitureSaveButtonBuilder from "@ui/furniture/FurnitureSaveButtonBuilder";
import { ShapeFieldSchemas } from "@ui/ShapeFieldSchemas";
import { DefaultShapeInteractiveConfig } from "@utils/shapes";

/**
 * Represents the editor scene
 * @class
 * @extends Phaser.Scene
 */
class FurnitureEditor extends Phaser.Scene {
  /**
   * Current tool selected
   * @type {string}
   * @default "move"
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
   */
  #moveManager = null;

  /**
   * Select manager
   * Also handles rotation and resizing from resize:ResizeManager and rotation:RotationManager
   * @type {SelectShapeManager}
   * @default null
   */
  #selectManager = null;

  /**
   * Panning manager
   * @type {PanningManager}
   * @default null
   */
  #panningManager = null;

  /**
   * Shape manager
   * @type {ShapeManager}
   * @default null
   */
  #shapeManager = null;

  /**
   * Shape manager for placement zones in the furniture
   * @type {ShapeManager}
   * @default []
   */
  #zoneManager = null;

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
   * Shape instruction handler
   * @type {ShapeInstructionsHandler}
   * @default null
   */
  #shapeInstructionHandler = null;

  /**
   * Zone instruction handler
   * @type {ShapeInstructionsHandler}
   * @default null
   */
  #zoneInstructionHandler = null;

  /**
   * Shape labeler
   * @type {ShapeLabeler}
   * @default null
   */
  #labeler = null;

  /**
   * Object containing references to UI elements
   * @type {Object}
   * @property {ShapeModalUserInterface|null} shapeModal - The shape modal UI
   * @property {ShapeModalUserInterface|null} zoneModal - The zone modal UI
   * @property {UndoRedoUserInterface|null} undoRedoUI - The undo/redo UI
   * @property {ShapeListUserInterface|null} shapeListUI - The shape list UI
   * @property {FurnitureSaveButtonUserInterface|null} saveButton - The furniture save button UI
   * @default { shapeModal: null, undoRedoUI: null, shapeListUI: null, saveButton: null}
   */
  #UIElements = {
    shapeModal: null,
    zoneModal: null,
    undoRedoUI: null,
    shapeListUI: null,
    saveButton: null,
  };

  /**
   * Constructor for the Editor scene
   * @constructor
   */
  constructor() {
    super("FurnitureEditor");
  }

  /**
   * Loads the furniture by its ID and returns the instructions to rebuild it
   * @param {string} furnitureId - The ID of the furniture to load
   * @async
   * @returns {Promise<Object>} An object containing shapeInstructions and zoneParameters
   */
  async #loadFurniture(furnitureId) {
    try {
      const response = await fetch(
        `${API_URL}/furniture-management/furniture/${furnitureId}`,
      );
      const furnitureData = await response.json();
      if (!response.ok) {
        if (furnitureData.errors && furnitureData.errors.length > 0) {
          alert(furnitureData.errors.join("\n"));
        }
        console.error("Failed to load furniture:", furnitureData);
        return;
      }
      console.log("Furniture data loaded:", furnitureData);

      const furnitureNameElement = document.getElementById("furnitureName");
      furnitureNameElement.value = furnitureData.name;

      const currentFurnitureIdElement =
        document.getElementById("currentFurnitureId");
      currentFurnitureIdElement.value = furnitureId;

      const topDownViewElement = document.getElementById("topDownView");
      topDownViewElement.value = furnitureData.topDownView.name;

      const shapeInstructions = [];
      const zoneParameters = [];

      if (furnitureData.shapes) {
        furnitureData.shapes.forEach((shapeData) => {
          // When we save the shape, the shapeId and shapeVersion are not set in the "primary" instruction as it
          // is redundant since the shape instance already carries that information.
          // However, when rebuilding the shape from instructions, we need that information in the instruction parameters.
          // So it will get correctly added to the metadata of the rebuilt shape.
          const instructions = shapeData.instructions;
          instructions[0].parameters.shapeId = shapeData.shape.id;
          instructions[0].parameters.shapeVersion = shapeData.shapeVersion;
          shapeInstructions.push(instructions);
        });
      }

      if (furnitureData.zones) {
        furnitureData.zones.forEach((zoneData) => {
          const instructions = zoneData.shape.instructions;
          instructions[0].parameters.shapeId = zoneData.shape.shape.id;
          instructions[0].parameters.shapeVersion = zoneData.shape.shapeVersion;
          zoneParameters.push({ instructions, name: zoneData.name });
        });
      }
      return { shapeInstructions, zoneParameters };
    } catch (error) {
      console.error("Error loading furniture:", error);
    }
  }

  /**
   * Initializes the scene
   * @public
   */
  init() {}

  /**
   * Creates the scene
   * @public
   */
  async create() {
    this.#selectManager = new SelectShapeManager(this);
    this.#moveManager = new MoveManager(this, new OutlineManager(this));
    this.#undoRedoManager = new UndoRedoManager(this, 100);
    this.#shapeManager = new ShapeManager(this, {
      move: this.#moveManager,
      select: this.#selectManager,
    });
    this.#zoneManager = new ShapeManager(this, {
      move: this.#moveManager,
      select: this.#selectManager,
    });
    this.#labeler = new ShapeLabeler(this);

    new CreateCommandEventHandler(
      this,
      this.#undoRedoManager,
      this.#shapeManager,
    );

    new LabeledCreateCommandEventHandler(
      this,
      this.#undoRedoManager,
      this.#zoneManager,
      this.#labeler,
    );

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
        shapeMoved: { extraPadding: 0, allowShrink: false },
        //shapeMoveEnd: { extraPadding: 0, allowShrink: true },
        shapeResized: { extraPadding: 40, allowShrink: false },
        //shapeResizeEnd: { extraPadding: 0, allowShrink: true },
        shapeRotated: { extraPadding: 0, allowShrink: false },
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

        rectangle.metadata = {};
        rectangle.metadata.id = params.templateId;
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
        ellipse.metadata = {};
        ellipse.metadata.id = params.templateId;
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
        arc.metadata = {};
        arc.metadata.id = params.templateId;
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
        polygon.metadata = {};
        polygon.metadata.id = params.templateId;
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
    this.#shapeManager.registerShape(
      "custom",
      async (_scene, params) => {
        console.log("params", params);
        try {
          const response = await fetch(
            API_URL +
              "/shape-management/shapes/" +
              params.templateId +
              "/template/latest",
          );

          const shapeData = await response.json();
          if (!response.ok) {
            if (shapeData.errors && shapeData.errors.length > 0) {
              alert(shapeData.errors.join("\n"));
            }
            console.error("Failed to load shape template:", shapeData);
            return;
          }

          const instructions = shapeData.instructions;
          console.log("Shape template data loaded:", shapeData);

          // Build from instructions returns array to make it more generic
          // but we only expect one shape to be returned
          const [reconstructedShapeSnapshot] =
            await this.#shapeInstructionHandler.convertFromInstructions(
              instructions,
              params.color,
            );
          0;
          const reconstructedShape =
            await this.#shapeManager.addShapeFromSnapshot(
              reconstructedShapeSnapshot,
              false,
            );

          reconstructedShape.metadata = {};
          reconstructedShape.metadata.id = params.templateId;
          reconstructedShape.metadata.version = shapeData.shape.version;
          reconstructedShape.setPosition(params.x, params.y);
          reconstructedShape.setDisplaySize(params.width, params.height);
          reconstructedShape.setRotation(params.rotation);
          return reconstructedShape;
        } catch (error) {
          console.error("Error fetching shape template:", error);
        }
      },
      { command: InstructionCommands.BEGIN_CONTAINER },
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
        rectangle.metadata = {};
        rectangle.metadata.id = params.templateId;
        rectangle.metadata.zoneName = params.zoneName;

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
        ellipse.metadata = {};
        ellipse.metadata.id = params.templateId;
        ellipse.metadata.zoneName = params.zoneName;

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

        arc.metadata = {};
        arc.metadata.id = params.templateId;
        arc.metadata.zoneName = params.zoneName;

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

        polygon.metadata = {};
        polygon.metadata.id = params.templateId;
        polygon.metadata.zoneName = params.zoneName;

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
    this.#zoneManager.registerShape(
      "custom",
      async (_scene, params) => {
        console.log("params", params);
        try {
          const response = await fetch(
            API_URL +
              "/shape-management/shapes/" +
              params.templateId +
              "/template/latest",
          );

          const shapeData = await response.json();
          if (!response.ok) {
            if (shapeData.errors && shapeData.errors.length > 0) {
              alert(shapeData.errors.join("\n"));
            }
            console.error("Failed to load shape template:", shapeData);
            return;
          }

          const instructions = shapeData.instructions;
          console.log("Shape template data loaded:", shapeData);

          // Build from instructions returns array to make it more generic
          // but we only expect one shape to be returned
          const [reconstructedShapeSnapshot] =
            await this.#zoneInstructionHandler.convertFromInstructions(
              instructions,
              params.color,
            );
          0;
          const reconstructedShape =
            await this.#zoneManager.addShapeFromSnapshot(
              reconstructedShapeSnapshot,
              false,
            );

          reconstructedShape.metadata = {};
          reconstructedShape.metadata.id = params.templateId;
          reconstructedShape.metadata.version = shapeData.shape.version;
          reconstructedShape.metadata.zoneName = params.zoneName;
          reconstructedShape.setPosition(params.x, params.y);
          reconstructedShape.setDisplaySize(params.width, params.height);
          reconstructedShape.setRotation(params.rotation);

          return reconstructedShape;
        } catch (error) {
          console.error("Error fetching shape template:", error);
        }
      },
      { command: InstructionCommands.BEGIN_CONTAINER },
    );

    this.#UIElements.shapeModal = new ShapeModalUserInterface(
      this.#shapeManager,
      this.#undoRedoManager,
      "newShapeModal",
      ["move", "select"],
      ShapeFieldSchemas,
    );

    const ZoneNameSchema = {
      type: "text",
      name: "zoneName",
      label: "Zone Name",
      attributes: {
        required: true,
        placeholder: "Enter zone name",
        name: "zoneName",
        minlength: 1,
      },
      validation: [
        {
          event: "change",
          handler: (event) => {
            const zoneNameInput = event.target;
            const zoneName = zoneNameInput.value.trim();
            if (zoneName === "") {
              zoneNameInput.value = `Zone ${this.#zoneManager.getRootShapes().length + 1}`;
            }
          },
        },
      ],
    };

    const LabelColorSchema = {
      type: "color",
      name: "labelColor",
      label: "Label Color",
      attributes: {
        required: true,
        value: "#ffffff",
        title: "Choose your label color",
        name: "labelColor",
      },
      classes: ["form-control-color"],
    };

    this.#UIElements.zoneModal = new LabeledShapeModalUserInterface(
      this.#zoneManager,
      this.#labeler,
      this.#undoRedoManager,
      "newZoneModal",
      ["move", "select"],
      {
        RECTANGLE: [
          ZoneNameSchema,
          ...ShapeFieldSchemas.RECTANGLE,
          LabelColorSchema,
        ],
        ELLIPSE: [
          ZoneNameSchema,
          ...ShapeFieldSchemas.ELLIPSE,
          LabelColorSchema,
        ],
        ARC: [ZoneNameSchema, ...ShapeFieldSchemas.ARC, LabelColorSchema],
        POLYGON: [
          ZoneNameSchema,
          ...ShapeFieldSchemas.POLYGON,
          LabelColorSchema,
        ],
        CUSTOM: [ZoneNameSchema, ...ShapeFieldSchemas.CUSTOM, LabelColorSchema],
      },
    );
    this.#UIElements.undoRedoUI = new UndoRedoUserInterface(
      this,
      this.#undoRedoManager,
      "undoButton",
      "redoButton",
    );

    this.#UIElements.shapeListUI = new ShapeListUserInterface(
      "itemsMenuButtons",
      (shapeType, shapeId, shapeName) => {
        const isAddZoneMode = document.getElementById("addZoneSwitch").checked;
        if (!isAddZoneMode) {
          this.#UIElements.shapeModal.openShapeModal(
            shapeType,
            shapeId,
            shapeName,
          );
        } else {
          this.#UIElements.zoneModal.openShapeModal(
            shapeType,
            shapeId,
            shapeName,
          );
        }
      },

      API_URL + "/shape-management/shapes",
    );

    this.#UIElements.saveButton = new FurnitureSaveButtonBuilder()
      .setGetZones(() => this.#zoneManager.getRootShapes())
      .setGetShapes(() => this.#shapeManager.getRootShapes())
      .setShapeInstructionsHandler(this.#shapeInstructionHandler)
      .setZoneInstructionsHandler(this.#zoneInstructionHandler)
      .setFurnitureManagementURL(API_URL + "/furniture-management/furniture")
      .setSaveButtonId("saveButton")
      .setFurnitureNameInputId("furnitureName")
      .setCurrentlyEditingFurnitureId("currentFurnitureId")
      .setAdditionalDataModalId("additionalDataModal")
      .setTopDownViewDataListId("topDownViewOptions")
      .setTopDownViewInputId("topDownView")
      .setShapeListElementId("itemsMenuButtons")
      .build();

    const urlParams = new URLSearchParams(window.location.search);
    const furnitureId = urlParams.get("furnitureId");
    if (furnitureId) {
      const { shapeInstructions, zoneParameters } =
        await this.#loadFurniture(furnitureId);

      const configureInteractive = (snapshots) => {
        snapshots.forEach((snapshot) => {
          const type = snapshot.metadata.type;

          const interactiveConfig = DefaultShapeInteractiveConfig[
            type.toUpperCase()
          ] || {
            draggable: true,
          };

          const managers = ["move", "select"];

          snapshot.additionalData = {
            interactive: interactiveConfig,
            managers: managers,
          };
        });
      };

      if (shapeInstructions && shapeInstructions.length > 0) {
        console.log("shapeInstructions", shapeInstructions);
        shapeInstructions.forEach(async (instructions) => {
          // Singular shape expected, even though method returns array for generality
          const shapeSnapshot =
            await this.#shapeInstructionHandler.convertFromInstructions(
              instructions,
              0xffffff,
            );
          configureInteractive(shapeSnapshot);
          this.#shapeManager.addShapeFromSnapshot(shapeSnapshot[0], true);
        });
      }

      if (zoneParameters && zoneParameters.length > 0) {
        zoneParameters.forEach(async (zoneParameter) => {
          const { instructions, name } = zoneParameter;
          // Singular shape expected, even though method returns array for generality
          const zoneSnapshot =
            await this.#zoneInstructionHandler.convertFromInstructions(
              instructions,
              0x00ff00,
            );
          configureInteractive(zoneSnapshot);
          zoneSnapshot[0].metadata.zoneName = name;
          const zone = await this.#zoneManager.addShapeFromSnapshot(
            zoneSnapshot[0],
            true,
          );
          this.#labeler.addLabel(
            zone,
            name,
            "#ffffff",
            (shape, newLabelText) => {
              shape.metadata.zoneName = newLabelText;
            },
          );
        });
      }
    }
  }

  /**
   * Updates the scene
   * @public
   */
  update() {
    if (this.#moveManager.isDragging && this.#panningManager.isPanning) {
      this.input.activePointer.updateWorldPoint(this.cameras.main);
      this.#moveManager.update(
        null,
        this.input.activePointer.worldX,
        this.input.activePointer.worldY,
      );
    }
    if (this.#selectManager.isResizing && this.#panningManager.isPanning) {
      this.input.activePointer.updateWorldPoint(this.cameras.main);
      this.#selectManager.update(
        this.input.activePointer.worldX,
        this.input.activePointer.worldY,
      );
    }
    this.#panningManager.update();
  }
}

export { FurnitureEditor as FurnitureEditor };
