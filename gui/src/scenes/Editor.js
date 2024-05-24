import Phaser from "phaser";
import { ResizeManager } from "../lib/resize/handles";
import { createRotationKnob } from "../lib/rotation/rotationKnob";

/**
 * Represents the editor scene
 * @class
 * @extends Phaser.Scene
 */
class Editor extends Phaser.Scene {
  /**
   * Array of shapes in the scene
   * @type {Phaser.GameObjects.Shape[]}
   */
  shapes = [];

  /**
   * Current tool selected
   * @type {string}
   * @default "move"
   * @private
   */
  currentTool = "move";

  /**
   * Last selected shape
   * @type {Phaser.GameObjects.Shape}
   * @private
   * @default null
   */
  lastSelected = null;

  /**
   * Rotation knob
   * @type {Phaser.GameObjects.Shape}
   * @private
   * @default null
   */
  rotationKnob = null;

  /**
   * Resize manager
   * @type {ResizeManager}
   * @private
   * @default null
   */
  resizeManager = null;

  /**
   * Flag to indicate if the knob is being dragged
   * @type {boolean}
   * @private
   * @default false
   */
  knobDragging = false;

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
   * Handles the unselect event
   * @public
   */
  handleUnselect() {
    if (
      this.knobDragging ||
      (this.resizeManager && this.resizeManager.resizing)
    ) {
      return;
    }
    console.log("unselect");
    if (this.lastSelected) {
      this.lastSelected.setFillStyle(0xff0000);
      this.lastSelected = null;
    }
    if (this.rotationKnob) {
      this.rotationKnob.destroy();
      this.rotationKnob = null;
    }

    this.resizeManager.hideResizeHandles();
  }

  /**
   * Handles the move button click event
   * @public
   */
  handleMoveButtonClick() {
    this.currentTool = "move";
    this.handleUnselect();
  }

  /**
   * Handles the select button click event
   * @public
   */
  handleSelectButtonClick() {
    this.currentTool = "select";
  }

  /**
   * Adds shape drag event
   * @param {Phaser.GameObjects.Shape} shape - Shape to add drag event to
   * @public
   */
  addShapeDrag(shape) {
    shape.on("drag", (_, dragX, dragY) => {
      if (this.currentTool === "move") {
        let height = shape.height;
        let width = shape.width;
        if (
          dragY >= height / 2 &&
          dragY + height / 2 < this.cameras.main.height &&
          dragX + width / 2 < this.cameras.main.width &&
          dragX >= width / 2
        ) {
          shape.setPosition(dragX, dragY);
        }
      }
    });
  }

  /**
   * Adds shape select event
   * @param {Phaser.GameObjects.Shape} shape - Shape to add select event to
   * @public
   */
  addShapeSelect(shape) {
    shape.on("pointerdown", (pointer, x, y, event) => {
      event.stopPropagation();
      if (this.currentTool === "select") {
        this.handleUnselect();

        shape.setFillStyle(0xffffff);
        this.lastSelected = shape;

        this.resizeManager.createResizeHandles(shape);
        createRotationKnob(shape, this);
      }
    });
  }

  /**
   * Creates the scene
   * @public
   */
  create() {
    this.resizeManager = new ResizeManager(this);

    this.cameras.main.setBackgroundColor(0x000000);

    this.addButtonHandler("move-button", "click", this.handleMoveButtonClick);
    this.addButtonHandler(
      "select-button",
      "click",
      this.handleSelectButtonClick,
    );

    this.shapes.push(this.add.rectangle(100, 300, 100, 100, 0xff0000));
    this.shapes.push(this.add.rectangle(300, 300, 100, 100, 0xff0000));
    this.shapes.push(this.add.ellipse(500, 500, 50, 100, 0xff0000));

    this.shapes[1].setRotation(Math.PI / 4);

    for (let i = 0; i < this.shapes.length; i++) {
      let shape = this.shapes[i];
      shape.setInteractive({ draggable: true });

      this.addShapeDrag(shape);
      this.addShapeSelect(shape, i);
    }
    this.input.on("pointerdown", this.handleUnselect, this);

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
