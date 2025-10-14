import Phaser from "phaser";
import { API_URL } from "@/config";
import PanningManager from "@managers/PanningManager";
import ZoomManager from "@managers/ZoomManager";
import MoveManager from "@managers/move/MoveManager";
import OutlineManager from "@managers/outlines/OutlineManager";
import SelectShapeManager from "@managers/select/SelectShapeManager";
import ShapeManager from "@managers/ShapeManager";
import ShapeEditorUIInitializer from "@lib/ShapeEditorUIInitializer";
import * as Shapes from "@shapes";
import { buildShapeFromInstructions } from "@utils/shapes";
import ShapeModalUserInterface from "@ui/ShapeModalUserInterface";
import ShapeInstructionsHandler from "@instructions/ShapeInstructionsHandler";

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
   * @private
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
   * @private
   */
  #moveManager = null;

  /**
   * Select manager
   * Also handles rotation and resizing from resize:ResizeManager and rotation:RotationManager
   * @type {SelectShapeManager}
   * @default null
   * @private
   */
  #selectManager = null;

  /**
   * Panning manager
   * @type {PanningManager}
   * @default null
   * @private
   */
  #panningManager = null;

  /**
   * Shape manager
   * @type {ShapeManager}
   * @default null
   * @private
   */
  #shapeManager = null;

  /**
   * Instruction handler
   * @type {ShapeInstructionsHandler}
   * @default null
   * @private
   */
  #instructionHandler = null;

  /**
   * Shape modal UI
   * @type {ShapeModalUserInterface}
   * @default null
   * @private
   */
  #shapeModalUI = null;

  /**
   * Loads a shape by its ID
   * @param {string} shapeId - The ID of the shape to load
   * @private
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
        if (
          containerStack.length === 0 &&
          instruction.command !== "endContainer"
        ) {
          instruction.parameters.positionX += worldPositionX;
          instruction.parameters.positionY += worldPositionY;
        }

        if (instruction.command === "beginContainer") {
          containerStack.push(instruction);
        }
        if (instruction.command === "endContainer") {
          containerStack.pop();
        }
      });

      const shapes = buildShapeFromInstructions(instructions, this);

      return shapes;
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
    const urlParams = new URLSearchParams(window.location.search);
    const shapeId = urlParams.get("shapeId");
    if (shapeId) {
      await this.#loadShape(shapeId);
    }

    this.#shapeManager = new ShapeManager(this);
    this.#instructionHandler = new ShapeInstructionsHandler(this.#shapeManager);

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
      { command: "CREATE_RECTANGLE" },
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
      { command: "CREATE_ELLIPSE" },
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
        command: "CREATE_ARC",
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
        command: "CREATE_POLYGON",
        fieldMap: { points: "polygonPoints" },
      },
    );
    this.#shapeManager.registerShape(
      "container",
      async (scene, params) => {
        const children = [];
        if (params.children && params.children.length > 0) {
          for (const childSnapshot of params.children) {
            const childShape =
              await this.#shapeManager.addShapeFromSnapshot(childSnapshot);

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
      { command: "BEGIN_CONTAINER" },
    );
    this.#shapeManager.registerShape(
      "custom",
      async (scene, params) => {
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
          const rebuiltShape = buildShapeFromInstructions(
            instructions,
            scene,
            params.color,
          )[0];

          rebuiltShape.metadata = {};
          rebuiltShape.metadata.id = params.templateId;
          rebuiltShape.metadata.version = shapeData.shape.version;
          rebuiltShape.setPosition(params.x, params.y);
          rebuiltShape.setDisplaySize(params.width, params.height);
          rebuiltShape.setRotation(params.rotation);
          return rebuiltShape;
        } catch (error) {
          console.error("Error fetching shape template:", error);
        }
      },
      { command: "BEGIN_CONTAINER" },
    );

    const camera = this.cameras.main;

    const scrollXElement = document.getElementById("scrollX");
    const scrollYElement = document.getElementById("scrollY");

    const cameraWidth = camera.width;
    const cameraHeight = camera.height;

    const initialWorldWidth = cameraWidth * 3;
    const initialWorldHeight = cameraHeight * 3;

    scrollXElement.max = initialWorldWidth;
    scrollYElement.max = initialWorldHeight;

    scrollXElement.value = cameraWidth;
    scrollYElement.value = cameraHeight;

    camera.setBounds(
      -cameraWidth,
      -cameraHeight,
      initialWorldWidth,
      initialWorldHeight,
    );

    scrollXElement.addEventListener("input", (event) => {
      const value = parseInt(event.target.value, 10);
      camera.scrollX = value - cameraWidth;
    });
    scrollYElement.addEventListener("input", (event) => {
      const value = parseInt(event.target.value, 10);
      camera.scrollY = value - cameraHeight;
    });

    this.events.on("postupdate", () => {
      scrollXElement.value = camera.scrollX + cameraWidth;
      scrollYElement.value = camera.scrollY + cameraHeight;
    });

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

    this.#selectManager = new SelectShapeManager(this);
    this.#moveManager = new MoveManager(this, new OutlineManager(this));
    this.#panningManager = new PanningManager(this);

    this.#panningManager.create();

    const zoomManager = new ZoomManager(this);
    zoomManager.create();

    this.#shapeModalUI = new ShapeModalUserInterface(
      this.#shapeManager,
      "newShapeModal",
      [this.#moveManager, this.#selectManager],
    );

    ShapeEditorUIInitializer.initialize(
      handleMoveButtonClick,
      handleSelectButtonClick,
      () => this.#currentTool,
      //addShape,
      this.#selectManager.hide.bind(this.#selectManager),
      // () => this.#shapes,
      () => this.#shapeManager.getAllShapes(),
      this.#shapeModalUI,
      this.#instructionHandler,
    );

    // for (let i = 0; i < this.#shapes.length; i++) {
    //   //let shape = this.#shapes[i];
    //   shape.setInteractive({ draggable: true });

    //   this.#moveManager.create(shape);
    //   this.#selectManager.create(shape);
    // }

    this.input.on("pointerdown", this.#selectManager.hide, this.#selectManager);
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
    this.#panningManager.update();
  }
}

export { ShapeEditor as ShapeEditor, DEFAULT_SHAPES };
