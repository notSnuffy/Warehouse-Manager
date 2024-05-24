import Phaser from "phaser";
import MoveManager from "../lib/move/MoveManager";
import SelectShapeManager from "../lib/select/SelectShapeManager";

/**
 * Represents the editor scene
 * @class
 * @extends Phaser.Scene
 */
class Editor extends Phaser.Scene {
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
   * Adds a button handler
   * @param {string} id - Id of the button
   * @param {string} eventType - Event type
   * @param {Function} eventHandler - Event handler
   * @param {Object} context - Context of the event handler
   * @public
   */
  addButtonHandler(id, eventType, eventHandler, context = this) {
    let button = document.getElementById(id);
    button.hidden = false;
    button.addEventListener(eventType, eventHandler.bind(context));
  }

  /**
   * Handles the move button click event
   * @public
   */
  handleMoveButtonClick() {
    this.#currentTool = "move";
    this.#selectManager.hide();
  }

  /**
   * Handles the select button click event
   * @public
   */
  handleSelectButtonClick() {
    this.#currentTool = "select";
  }

  /**
   * Creates the scene
   * @public
   */
  create() {
    this.#selectManager = new SelectShapeManager(this);
    this.#moveManager = new MoveManager(this);

    this.cameras.main.setBackgroundColor(0x000000);

    this.addButtonHandler("move-button", "click", this.handleMoveButtonClick);
    this.addButtonHandler(
      "select-button",
      "click",
      this.handleSelectButtonClick,
    );

    this.#shapes.push(this.add.rectangle(100, 300, 100, 100, 0xff0000));
    this.#shapes.push(this.add.rectangle(300, 300, 100, 100, 0xff0000));
    this.#shapes.push(this.add.ellipse(500, 500, 50, 100, 0xff0000));

    this.#shapes[1].setRotation(Math.PI / 4);

    for (let i = 0; i < this.#shapes.length; i++) {
      let shape = this.#shapes[i];
      shape.setInteractive({ draggable: true });

      this.#moveManager.create(shape);
      this.#selectManager.create(shape);
    }
    this.input.on("pointerdown", this.#selectManager.hide, this.#selectManager);

    this.space = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );
  }

  /**
   * Updates the scene
   * @public
   */
  update() {
    if (Phaser.Input.Keyboard.JustDown(this.space)) {
      console.log("Shapes:");
      for (let i = 0; i < this.shapes.length; i++) {
        let shape = this.shapes[i];
        console.log(
          "x: ",
          shape.x,
          "y: ",
          shape.y,
          "rotation: ",
          shape.rotation,
          "width: ",
          shape.width,
          "height: ",
          shape.height,
        );
      }
    }
  }
}

export { Editor };
