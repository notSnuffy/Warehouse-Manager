import Phaser from "phaser";
import { API_URL } from "../config";
import MoveManager from "../lib/move/MoveManager";
import SelectShapeManager from "../lib/select/SelectShapeManager";
import ShapeEditorUIInitializer from "../lib/ShapeEditorUIInitializer";
import * as Shapes from "../shapes";
import { buildShapeFromInstructions } from "../lib/functions/shapes";

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
   * Loads a shape by its ID
   * @param {string} shapeId - The ID of the shape to load
   * @private
   * @async
   */
  async #loadShape(shapeId) {
    try {
      const shapeInstance = await fetch(
        API_URL + "/shape-management/shapes/" + shapeId + "/template",
      );
      const shapeData = await shapeInstance.json();

      const shapeNameElement = document.getElementById("shapeName");
      shapeNameElement.value = shapeData.shape.name;

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

    const addShape = async function (shapeType, parameters) {
      console.log(shapeType, parameters);
      if (shapeType === "rectangle") {
        this.#shapes.push(
          new Shapes.Rectangle(
            this,
            parameters.x,
            parameters.y,
            parameters.width,
            parameters.height,
            parameters.color,
          ),
        );
      } else if (shapeType === "ellipse") {
        this.#shapes.push(
          new Shapes.Ellipse(
            this,
            parameters.x,
            parameters.y,
            parameters.width,
            parameters.height,
            parameters.color,
          ),
        );
      } else if (shapeType === "arc") {
        this.#shapes.push(
          new Shapes.Arc(
            this,
            parameters.x,
            parameters.y,
            parameters.radius,
            0,
            parameters.angle,
            false,
            parameters.color,
          ),
        );
      } else if (shapeType === "polygon") {
        this.#shapes.push(
          new Shapes.Polygon(
            this,
            parameters.x,
            parameters.y,
            parameters.points,
            parameters.color,
          ),
        );
      } else {
        const id = parameters.id;

        try {
          const shapeInstance = await fetch(
            API_URL + "/shape-management/shapes/" + id + "/template",
          );
          const shapeData = await shapeInstance.json();
          const instructions = shapeData.instructions;
          // Build from instructions returns array to make it more generic
          // but we only expect one shape to be returned
          const rebuiltShape = buildShapeFromInstructions(
            instructions,
            this,
          )[0];

          rebuiltShape.setPosition(parameters.x, parameters.y);

          this.#shapes.push(rebuiltShape);
        } catch (error) {
          console.error("Error fetching shape template:", error);
        }
      }

      const shape = this.#shapes[this.#shapes.length - 1];

      shape.setInteractive({ draggable: true });
      this.#moveManager.create(shape);
      this.#selectManager.create(shape);
    }.bind(this);

    this.#selectManager = new SelectShapeManager(this);
    this.#moveManager = new MoveManager(this);

    ShapeEditorUIInitializer.initialize(
      handleMoveButtonClick,
      handleSelectButtonClick,
      addShape,
      DEFAULT_SHAPES,
      this.#selectManager.hide.bind(this.#selectManager),
      () => this.#shapes,
    );

    // const container = new Shapes.Container(this, 300, 300, []);
    // this.#shapes.push(container);

    // const rect1 = new Shapes.Rectangle(this, -100, -100, 100, 100, 0xff0000);
    // const rect2 = new Shapes.Rectangle(this, 50, 50, 200, 200, 0xff0000);
    // const rect3 = new Shapes.Rectangle(this, -100, 100, 100, 100, 0x0000ff);
    // const rect4 = new Shapes.Rectangle(this, 100, -100, 100, 100, 0x00ffff);
    // container.add([rect1, rect2, rect3, rect4]);

    //container.add([
    //  new Shapes.Rectangle(this, -100, -100, 100, 100, 0xff0000),
    //  new Shapes.Rectangle(this, 50, 50, 200, 200, 0xff0000),
    //  new Shapes.Ellipse(this, 100, -100, 100, 100, 0x00ff00),
    //]);

    //this.#shapes.push(
    //  new Shapes.Arc(
    //    this,
    //    151,
    //    115,
    //    50,
    //    0,
    //    180,
    //    false,
    //    0x0000ff,
    //  ).setDisplaySize(301, 230),
    //);
    //this.#shapes.push(
    //  new Shapes.Polygon(
    //    this,
    //    400,
    //    400,
    //    [0, 0, 50, 50, 0, 50],
    //    0xffff00,
    //  ).setDisplaySize(100, 200),
    //);
    // const rect = container.getBounds();
    // container.setSize(rect.width, rect.height);
    // container.setRotation(Math.PI / 4);

    // const rootContainer = saveShapeInstance(this.#shapes);
    // const instructions = saveShapeAsInstructions(rootContainer);

    // console.log(instructions);
    // this.#shapes.forEach((shape) => {
    //   if (shape.type === "Container") {
    //     shape.removeAll(true);
    //   }
    //   shape.destroy();
    // });
    // const rebuiltShapes = buildShapeFromInstructions(instructions, this);
    // console.log(rebuiltShapes);
    // this.#shapes = rebuiltShapes;

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
  update() {}
}

export { ShapeEditor as ShapeEditor, DEFAULT_SHAPES };
