import Phaser from "phaser";
import { API_URL } from "../config";
import PanningManager from "../lib/PanningManager";
import ZoomManager from "../lib/ZoomManager";
import MoveManager from "../lib/move/MoveManager";
import SelectShapeManager from "../lib/select/SelectShapeManager";
import ShapeEditorUIInitializer from "../lib/ShapeEditorUIInitializer";
import * as Shapes from "../shapes";
import {
  buildShapeFromInstructions,
  ShapeTypes,
} from "../lib/functions/shapes";

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
   * Array of shapes in the scene
   * @type {Phaser.GameObjects.Shape[]}
   * @private
   */
  #shapes = [];

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

      this.#shapes = buildShapeFromInstructions(instructions, this);
      console.log("Shape loaded successfully:", this.#shapes);
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

    const addShape = async function (shapeId, parameters) {
      if (shapeId === ShapeTypes.RECTANGLE) {
        const rectangle = new Shapes.Rectangle(
          this,
          parameters.x,
          parameters.y,
          parameters.width,
          parameters.height,
          parameters.color,
        );
        rectangle.setRotation(parameters.rotation);
        rectangle.setInteractive({ draggable: true });
        this.#shapes.push(rectangle);
      } else if (shapeId === ShapeTypes.ELLIPSE) {
        const ellipse = new Shapes.Ellipse(
          this,
          parameters.x,
          parameters.y,
          parameters.width,
          parameters.height,
          parameters.color,
        );
        ellipse.setRotation(parameters.rotation);

        const hitArea = ellipse.geom;
        ellipse.setInteractive({
          hitArea: hitArea,
          hitAreaCallback: Phaser.Geom.Ellipse.Contains,
          draggable: true,
        });
        this.#shapes.push(ellipse);
      } else if (shapeId === ShapeTypes.ARC) {
        const arc = new Shapes.Arc(
          this,
          parameters.x,
          parameters.y,
          parameters.radius,
          parameters.startAngle,
          parameters.endAngle,
          false,
          parameters.color,
        );
        arc.setRotation(parameters.rotation);

        const hitArea = new Phaser.Geom.Polygon(arc.pathData);
        arc.setInteractive({
          hitArea: hitArea,
          hitAreaCallback: Phaser.Geom.Polygon.Contains,
          draggable: true,
        });

        this.#shapes.push(arc);
      } else if (shapeId === ShapeTypes.POLYGON) {
        const polygon = new Shapes.Polygon(
          this,
          parameters.x,
          parameters.y,
          parameters.points,
          parameters.color,
        );
        polygon.setRotation(parameters.rotation);
        const hitArea = polygon.geom;
        polygon.setInteractive({
          hitArea: hitArea,
          hitAreaCallback: Phaser.Geom.Polygon.Contains,
          draggable: true,
        });
        this.#shapes.push(polygon);
      } else {
        try {
          const shapeInstance = await fetch(
            API_URL +
              "/shape-management/shapes/" +
              shapeId +
              "/template/latest",
          );
          const shapeData = await shapeInstance.json();
          const instructions = shapeData.instructions;
          // Build from instructions returns array to make it more generic
          // but we only expect one shape to be returned
          const rebuiltShape = buildShapeFromInstructions(
            instructions,
            this,
            parameters.color,
          )[0];

          rebuiltShape.id = shapeId;
          rebuiltShape.version = shapeData.shape.version;
          rebuiltShape.setPosition(parameters.x, parameters.y);
          rebuiltShape.setDisplaySize(parameters.width, parameters.height);
          rebuiltShape.setRotation(parameters.rotation);

          rebuiltShape.setInteractive({ draggable: true });

          this.#shapes.push(rebuiltShape);
        } catch (error) {
          console.error("Error fetching shape template:", error);
        }
      }

      const shape = this.#shapes[this.#shapes.length - 1];

      //shape.setInteractive({ draggable: true });
      this.#moveManager.create(shape);
      this.#selectManager.create(shape);
    }.bind(this);

    this.#selectManager = new SelectShapeManager(this);
    this.#moveManager = new MoveManager(this);
    this.#panningManager = new PanningManager(this);

    this.#panningManager.create();

    const zoomManager = new ZoomManager(this);
    zoomManager.create();

    ShapeEditorUIInitializer.initialize(
      handleMoveButtonClick,
      handleSelectButtonClick,
      addShape,
      this.#selectManager.hide.bind(this.#selectManager),
      () => this.#shapes,
    );

    for (let i = 0; i < this.#shapes.length; i++) {
      let shape = this.#shapes[i];
      shape.setInteractive({ draggable: true });

      this.#moveManager.create(shape);
      this.#selectManager.create(shape);
    }

    this.input.on("pointerdown", this.#selectManager.hide, this.#selectManager);
  }

  /**
   * Updates the scene
   * @public
   */
  update() {
    if (this.#moveManager.isDragging && this.#panningManager.isPanning) {
      this.input.activePointer.updateWorldPoint(this.cameras.main);
      this.#moveManager.currentlyMoving.setPosition(
        this.input.activePointer.worldX,
        this.input.activePointer.worldY,
      );
    }
    this.#panningManager.update();
  }
}

export { ShapeEditor as ShapeEditor, DEFAULT_SHAPES };
