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
    this.#shapes.push(this.add.rectangle(300, 300, 100, 300, 0xff0000));
    this.#shapes.push(this.add.ellipse(500, 500, 50, 100, 0xff0000));

    this.#shapes[1].setRotation(0);
    let test_shape = this.#shapes[1];
    const bottomRight = test_shape.getBottomRight();
    const topRight = test_shape.getTopRight();
    const bottomLeft = test_shape.getBottomLeft();
    const topLeft = test_shape.getTopLeft();

    console.log("Bottom Right: ", bottomRight);
    console.log("Top Right: ", topRight);
    console.log("Bottom Left: ", bottomLeft);
    console.log("Top Left: ", topLeft);

    let dirA = new Phaser.Math.Vector2(
      topRight.x - topLeft.x,
      topRight.y - topLeft.y,
    );

    let x_delta = 30 / dirA.length();
    x_delta = x_delta * (topLeft.y - topRight.y);
    let y_delta = 30 / dirA.length();
    y_delta = y_delta * (topRight.x - topLeft.x);

    let newTopLeft = new Phaser.Math.Vector2(
      topLeft.x + x_delta,
      topLeft.y + y_delta,
    );

    let newTopRight = new Phaser.Math.Vector2(
      topRight.x + x_delta,
      topRight.y + y_delta,
    );

    this.add
      .line(
        0,
        0,
        newTopLeft.x,
        newTopLeft.y,
        newTopRight.x,
        newTopRight.y,
        0x00ff00,
      )
      .setOrigin(0, 0);

    let dirB = new Phaser.Math.Vector2(
      bottomLeft.x - topLeft.x,
      bottomLeft.y - topLeft.y,
    );

    x_delta = -30 / dirB.length();
    x_delta = x_delta * (topLeft.y - bottomLeft.y);
    y_delta = -30 / dirB.length();
    y_delta = y_delta * (bottomLeft.x - topLeft.x);

    let newBottomLeft = new Phaser.Math.Vector2(
      bottomLeft.x + x_delta,
      bottomLeft.y + y_delta,
    );

    let newTopLeftB = new Phaser.Math.Vector2(
      topLeft.x + x_delta,
      topLeft.y + y_delta,
    );

    this.add
      .line(
        0,
        0,
        newTopLeftB.x,
        newTopLeftB.y,
        newBottomLeft.x,
        newBottomLeft.y,
        0x00ff00,
      )
      .setOrigin(0, 0);

    let mousePos = this.input.activePointer.position;
    let mouseFollower = this.add.circle(mousePos.x, mousePos.y, 5, 0x00ff00);

    // Function to get the line equation value at a point (x, y)
    function lineValue(A, B, C, x, y) {
      return A * x + B * y + C;
    }

    // Get line equation coefficients for lineA (through topLeft and extendedTopRight)
    let A1 = newTopRight.y - newTopLeft.y;
    let B1 = newTopLeft.x - newTopRight.x;
    let C1 = newTopRight.x * newTopLeft.y - newTopLeft.x * newTopRight.y;

    // Get line equation coefficients for lineB (through topLeft and extendedBottomLeft)
    let A2 = newBottomLeft.y - newTopLeft.y;
    let B2 = newTopLeft.x - newBottomLeft.x;
    let C2 = newBottomLeft.x * newTopLeft.y - newTopLeft.x * newBottomLeft.y;

    this.input.on("pointermove", (pointer) => {
      let currentMousePos = new Phaser.Math.Vector2(pointer.x, pointer.y);
      mouseFollower.setPosition(pointer.x, pointer.y);

      // Calculate line equation values at current mouse position
      let currValueA = lineValue(
        A1,
        B1,
        C1,
        currentMousePos.x,
        currentMousePos.y,
      );
      let currValueB = lineValue(
        A2,
        B2,
        C2,
        currentMousePos.x,
        currentMousePos.y,
      );

      // Check if the mouse is outside lineA (above)
      if (currValueA >= 0) {
        console.log("Mouse is outside lineA");
      }

      // Check if the mouse is outside lineB (left)
      if (currValueB <= 0) {
        console.log("Mouse is outside lineB");
      }
    });

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
