import Phaser from "phaser";
import { API_URL } from "@/config";
import PanningManager from "@managers/PanningManager";
import ZoomManager from "@managers/ZoomManager";
import MoveManager from "@managers/move/MoveManager";
import OutlineManager from "@managers/outlines/OutlineManager";
import SelectShapeManager from "@managers/select/SelectShapeManager";
import ShapeManager from "@managers/ShapeManager";
import CameraBoundsManager from "@managers/CameraBoundsManager";
import ScrollbarManager from "@managers/ScrollbarManager";
import UndoRedoManager from "@managers/UndoRedoManager";
import CreateCommandEventHandler from "@managers/CreateCommandEventHandler";
import ShapeEditorUIInitializer from "@lib/ShapeEditorUIInitializer";
import * as Shapes from "@shapes";
import { DefaultShapeInteractiveConfig } from "@utils/shapes";
import ShapeModalUserInterface from "@ui/ShapeModalUserInterface";
import ShapeInstructionsHandler from "@instructions/ShapeInstructionsHandler";
import InstructionCommands from "@instructions/InstructionCommands";

/**
 * Default shapes
 * @type {string[]}
 * @constant
 */
const DEFAULT_SHAPES = ["rectangle", "ellipse", "arc", "polygon"];

/**
 * Represents the editor scene
 * @class
 * @extends Phaser.Scene
 */
class ShapeEditor extends Phaser.Scene {
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
   * Instruction handler
   * @type {ShapeInstructionsHandler}
   * @default null
   */
  #instructionHandler = null;

  /**
   * Shape modal UI
   * @type {ShapeModalUserInterface}
   * @default null
   */
  #shapeModalUI = null;

  /**
   * Loads a shape by its ID
   * @param {string} shapeId - The ID of the shape to load
   * @return {Promise<Array>} The instructions of the loaded shape
   * @async
   */
  async #loadShape(shapeId) {
    try {
      const shapeInstance = await fetch(
        API_URL + "/shape-management/shapes/" + shapeId + "/template/latest",
      );
      const shapeData = await shapeInstance.json();
      if (!shapeInstance.ok) {
        if (shapeData.errors && shapeData.errors.length > 0) {
          alert(shapeData.errors.join("\n"));
        }
        console.error("Failed to load shape:", shapeData);
        return;
      }

      const shapeNameElement = document.getElementById("shapeName");
      shapeNameElement.value = shapeData.shape.name;
      const currentShapeIdElement = document.getElementById("currentShapeId");
      currentShapeIdElement.value = shapeId;

      const instructions = shapeData.instructions;
      console.log("Shape data loaded:", shapeData);
      // Saves the world position of the shape wrapper container
      const worldPositionX = instructions[0].parameters.positionX;
      const worldPositionY = instructions[0].parameters.positionY;
      instructions.shift();
      instructions.pop();
      console.log(instructions);
      // Adjusts the position of the shapes based on the world position
      const containerStack = [];
      instructions.forEach((instruction) => {
        console.log(instruction);
        if (
          containerStack.length === 0 &&
          instruction.command !== InstructionCommands.END_CONTAINER
        ) {
          instruction.parameters.positionX += worldPositionX;
          instruction.parameters.positionY += worldPositionY;
        }

        if (instruction.command === InstructionCommands.BEGIN_CONTAINER) {
          containerStack.push(instruction);
        }
        if (instruction.command === InstructionCommands.END_CONTAINER) {
          containerStack.pop();
        }
      });

      return instructions;
    } catch (error) {
      console.error("Error fetching shape data:", error);
    }
  }

  /**
   * Constructor for the Editor scene
   * @constructor
   */
  constructor() {
    super("ShapeEditor");
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
    this.#undoRedoManager = new UndoRedoManager(this);
    this.#shapeManager = new ShapeManager(this, this.#undoRedoManager, {
      move: this.#moveManager,
      select: this.#selectManager,
    });

    new CreateCommandEventHandler(
      this,
      this.#undoRedoManager,
      this.#shapeManager,
    );

    this.#instructionHandler = new ShapeInstructionsHandler(this.#shapeManager);
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
        shapeMoveEnd: { extraPadding: 0, allowShrink: true },
        shapeResized: { extraPadding: 40, allowShrink: false },
        shapeResizeEnd: { extraPadding: 0, allowShrink: true },
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
            await this.#instructionHandler.convertFromInstructions(
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

    const urlParams = new URLSearchParams(window.location.search);
    const shapeId = urlParams.get("shapeId");
    if (shapeId) {
      const loadedInstructions = await this.#loadShape(shapeId);
      if (loadedInstructions && loadedInstructions.length > 0) {
        const shapesSnapshots =
          await this.#instructionHandler.convertFromInstructions(
            loadedInstructions,
            0xffffff,
          );
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
            //if (snapshot.children && snapshot.children.length > 0) {
            //  configureInteractive(snapshot.children);
            //}
          });
        };
        configureInteractive(shapesSnapshots);
        for (const shapeSnapshot of shapesSnapshots) {
          this.#shapeManager.addShapeFromSnapshot(shapeSnapshot, true);
        }
      }
    }

    /**
     * Handles the move button click event
     */
    const handleMoveButtonClick = function () {
      this.#currentTool = "move";
      this.#selectManager.hide();
    }.bind(this);

    /**
     * Handles the select button click event
     */
    const handleSelectButtonClick = function () {
      this.#currentTool = "select";
    }.bind(this);

    this.#shapeModalUI = new ShapeModalUserInterface(
      this.#shapeManager,
      "newShapeModal",
      ["move", "select"],
    );

    ShapeEditorUIInitializer.initialize(
      handleMoveButtonClick,
      handleSelectButtonClick,
      () => this.#currentTool,
      //addShape,
      this.#selectManager.hide.bind(this.#selectManager),
      // () => this.#shapes,
      () => this.#shapeManager.getRootShapes(),
      this.#shapeModalUI,
      this.#instructionHandler,
    );

    // for (let i = 0; i < this.#shapes.length; i++) {
    //   //let shape = this.#shapes[i];
    //   shape.setInteractive({ draggable: true });

    //   this.#moveManager.create(shape);
    //   this.#selectManager.create(shape);
    // }

    //this.input.on("pointerdown", () => {
    //  const shape = this.#shapeManager.getRootShapes()[0];
    //  shape.list.forEach((child) => {
    //    child.input.enabled = !child.input.enabled;
    //  });
    //});
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

export { ShapeEditor as ShapeEditor, DEFAULT_SHAPES };
