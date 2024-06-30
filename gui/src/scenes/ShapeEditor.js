import Phaser from "phaser";
import MoveManager from "../lib/move/MoveManager";
import SelectShapeManager from "../lib/select/SelectShapeManager";
import ShapeEditorUIInitializer from "../lib/ShapeEditorUIInitializer";

/**
 * Default shapes
 * @type {string[]}
 * @constant
 */
const DEFAULT_SHAPES = ["rectangle", "ellipse", "arc"];

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
   * Constructor for the Editor scene
   * @constructor
   */
  constructor() {
    super("Game");
  }

  /**
   * Initializes the scene
   * @param {Object} data - Data passed from the previous scene
   * @public
   */
  init(data) {
    this.hello = data;
  }

  /**
   * Creates the scene
   * @public
   */
  async create() {
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

    const addShape = function (shapeType, parameters) {
      if (shapeType === "rectangle") {
        this.#shapes.push(
          this.add.rectangle(
            parameters.x,
            parameters.y,
            parameters.width,
            parameters.height,
            parameters.color,
          ),
        );
      } else if (shapeType === "ellipse") {
        this.#shapes.push(
          this.add.ellipse(
            parameters.x,
            parameters.y,
            parameters.width,
            parameters.height,
            parameters.color,
          ),
        );
      } else if (shapeType === "arc") {
        this.#shapes.push(
          this.add.arc(
            parameters.x,
            parameters.y,
            parameters.radius,
            0,
            parameters.angle,
            false,
            parameters.color,
          ),
        );
      }

      const shape = this.#shapes[this.#shapes.length - 1];

      shape.setInteractive({ draggable: true });
      this.#moveManager.create(shape);
      this.#selectManager.create(shape);
    }.bind(this);

    const saveShape = function () {
      for (let i = 0; i < this.#shapes.length; i++) {
        const shape = this.#shapes[i];
        console.log(
          shape.x,
          shape.y,
          shape.width,
          shape.height,
          shape.fillColor.toString(16),
        );
      }
    }.bind(this);

    this.#selectManager = new SelectShapeManager(this);
    this.#moveManager = new MoveManager(this);

    ShapeEditorUIInitializer.initialize(
      handleMoveButtonClick,
      handleSelectButtonClick,
      addShape,
      DEFAULT_SHAPES,
      saveShape,
      this.#selectManager.hide.bind(this.#selectManager),
    );

    this.cameras.main.setBackgroundColor(0x000000);

    this.#shapes.push(this.add.rectangle(100, 300, 100, 100, 0xff0000));
    this.#shapes.push(this.add.rectangle(300, 300, 100, 300, 0xff0000));
    this.#shapes.push(this.add.ellipse(600, 500, 50, 100, 0xff0000));
    this.#shapes.push(this.add.arc(700, 700, 50, 0, 180, false, 0xff0000));

    this.#shapes[1].setRotation(0);

    for (let i = 0; i < this.#shapes.length; i++) {
      let shape = this.#shapes[i];
      shape.setInteractive({ draggable: true });

      this.#moveManager.create(shape);
      this.#selectManager.create(shape);
    }

    this.input.on("pointerdown", this.#selectManager.hide, this.#selectManager);

    try {
      const response = await fetch("http://localhost:8080/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hello: "world" }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const _data = await response.json();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Updates the scene
   * @public
   */
  update() {}
}

export { ShapeEditor as ShapeEditor, DEFAULT_SHAPES };
