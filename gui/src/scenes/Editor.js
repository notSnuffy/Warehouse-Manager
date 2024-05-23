import Phaser from "phaser";

/**
 * Radius of the rotation knob
 * @type {number}
 */
const ROTATION_KNOB_RADIUS = 10;

/**
 * Represents the editor scene
 * @class
 * @extends Phaser.Scene
 * @memberof GUI
 *
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
   * Flag to indicate if the knob is being dragged
   * @type {boolean}
   * @private
   * @default false
   */
  knobDragging = false;

  /**
   * Array of resize handles
   * @type {Phaser.GameObjects.Shape[]}
   * @default []
   */
  resizeHandles = [];

  /**
   * Flag to indicate if the shape is being resized
   * @type {boolean}
   * @default false
   * @private
   */
  resizing = false;

  /**
   * Edge being resized
   * @type {number}
   * @default null
   * @private
   */
  resizeEdge = null;

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
    if (this.knobDragging || this.resizing) {
      return;
    }
    if (this.lastSelected) {
      this.lastSelected.setFillStyle(0xff0000);
      this.lastSelected = null;
    }
    if (this.rotationKnob) {
      this.rotationKnob.destroy();
      this.rotationKnob = null;
    }

    this.hideResizeHandles();
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
   * Creates the rotation knob
   * @param {Phaser.GameObjects.Shape} shape - Shape to create the rotation knob for
   * @public
   * @returns {void}
   */
  createRotationKnob(shape) {
    this.rotationKnob = this.add
      .circle(
        shape.getTopCenter().x +
          ROTATION_KNOB_RADIUS * Math.cos(shape.rotation - Math.PI / 2),
        shape.getTopCenter().y +
          ROTATION_KNOB_RADIUS * Math.sin(shape.rotation - Math.PI / 2),
        ROTATION_KNOB_RADIUS,
        0x888888,
      )
      .setInteractive({ draggable: true });

    this.rotationKnob.on("dragstart", () => {
      this.knobDragging = true;
    });

    this.rotationKnob.on(
      "drag",
      this.handleRotationDrag(shape, this.rotationKnob),
    );

    this.rotationKnob.on("dragend", () => {
      this.knobDragging = false;
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

        this.createResizeHandles(shape);
        this.createRotationKnob(shape);
      }
    });
  }

  /**
   * Creates the scene
   * @public
   */
  create() {
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

    console.log(this.shapes[2]);

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

  /**
   * Handles the rotation drag event
   * @param {Phaser.GameObjects.Shape} shape - Shape to rotate
   * @param {Phaser.GameObjects.Shape} rotationKnob - Rotation knob
   * @returns {Function} - Event handler
   * @public
   */
  handleRotationDrag(shape, rotationKnob) {
    return (_, dragX, dragY) => {
      shape.rotation = Math.atan2(dragY - shape.y, dragX - shape.x);
      this.updateRotationKnob(shape, rotationKnob);
      this.updateResizeHandles(shape);
    };
  }

  /**
   * Updates the rotation knob
   * @param {Phaser.GameObjects.Shape} shape - Shape to update the rotation knob for
   * @param {Phaser.GameObjects.Shape} rotationKnob - Rotation knob
   * @public
   * @returns {void}
   */
  updateRotationKnob(shape, rotationKnob) {
    rotationKnob.setPosition(
      shape.getTopCenter().x +
        ROTATION_KNOB_RADIUS * Math.cos(shape.rotation - Math.PI / 2),
      shape.getTopCenter().y +
        ROTATION_KNOB_RADIUS * Math.sin(shape.rotation - Math.PI / 2),
    );
  }

  /**
   * Creates resize handles for a shape
   * @param {Phaser.GameObjects.Shape} shape - Shape to create resize handles for
   * @public
   * @returns {void}
   */
  createResizeHandles(shape) {
    const bottomLeft = shape.getBottomLeft();
    const bottomRight = shape.getBottomRight();
    const topLeft = shape.getTopLeft();
    const topRight = shape.getTopRight();
    const topCenter = shape.getTopCenter();
    const bottomCenter = shape.getBottomCenter();
    const leftCenter = shape.getLeftCenter();
    const rightCenter = shape.getRightCenter();
    const handles = [
      {
        x: topLeft.x,
        y: topLeft.y,
        width: 10,
        height: 10,
      }, // Top-left
      {
        x: topRight.x,
        y: topRight.y,
        width: 10,
        height: 10,
      }, // Top-right
      {
        x: bottomRight.x,
        y: bottomRight.y,
        width: 10,
        height: 10,
      }, // Bottom-right
      {
        x: bottomLeft.x,
        y: bottomLeft.y,
        width: 10,
        height: 10,
      }, // Bottom-left
      {
        x: topCenter.x,
        y: topCenter.y,
        width: shape.width - 10,
        height: 2,
      }, // Top
      {
        x: rightCenter.x,
        y: rightCenter.y,
        width: 2,
        height: shape.height - 10,
      }, // Right
      {
        x: bottomCenter.x,
        y: bottomCenter.y,
        width: shape.width - 10,
        height: 2,
      }, // Bottom
      {
        x: leftCenter.x,
        y: leftCenter.y,
        width: 2,
        height: shape.height - 10,
      }, // Left
    ];

    const cursorStyles = [
      "nwse-resize",
      "nesw-resize",
      "nwse-resize",
      "nesw-resize",
      "ns-resize",
      "ew-resize",
      "ns-resize",
      "ew-resize",
    ];

    for (let i = 0; i < handles.length; i++) {
      const handle = handles[i];
      const resizeHandle = this.add
        .rectangle(handle.x, handle.y, handle.width, handle.height, 0x888888)
        .setInteractive({ cursor: cursorStyles[i], draggable: true });
      resizeHandle.setRotation(shape.rotation);

      resizeHandle.on("dragstart", () => {
        this.resizing = true;
        this.resizeEdge = i;
      });

      resizeHandle.on("drag", (_, dragX, dragY) => {
        if (this.currentTool === "select") {
          let width, height, newX, newY;
          const old_width = shape.width;
          const old_height = shape.height;

          const topNewHeight = shape.y - dragY + shape.height / 2;
          const rightNewWidth = dragX - shape.x + shape.width / 2;
          const bottomNewHeight = dragY - shape.y + shape.height / 2;
          const leftNewWidth = shape.x - dragX + shape.width / 2;
          switch (this.resizeEdge) {
            case 0: // Top-left
              width = leftNewWidth >= 1 ? leftNewWidth : shape.width;
              height = topNewHeight >= 1 ? topNewHeight : shape.height;
              newX = leftNewWidth >= 1 ? dragX + width / 2 : shape.x;
              newY = topNewHeight >= 1 ? dragY + height / 2 : shape.y;
              break;
            case 1: // Top-right
              width = rightNewWidth >= 1 ? rightNewWidth : shape.width;
              height = topNewHeight >= 1 ? topNewHeight : shape.height;
              newX =
                rightNewWidth >= 1
                  ? shape.x + (width - old_width) / 2
                  : shape.x;
              newY = topNewHeight >= 1 ? dragY + height / 2 : shape.y;
              break;
            case 2: // Bottom-right
              width = rightNewWidth >= 1 ? rightNewWidth : shape.width;
              height = bottomNewHeight >= 1 ? bottomNewHeight : shape.height;
              newX =
                rightNewWidth >= 1
                  ? shape.x + (width - old_width) / 2
                  : shape.x;
              newY =
                bottomNewHeight >= 1
                  ? shape.y + (height - old_height) / 2
                  : shape.y;
              break;
            case 3: // Bottom-left
              width = leftNewWidth >= 1 ? leftNewWidth : shape.width;
              height = bottomNewHeight >= 1 ? bottomNewHeight : shape.height;
              newX = leftNewWidth >= 1 ? dragX + width / 2 : shape.x;
              newY =
                bottomNewHeight >= 1
                  ? shape.y + (height - old_height) / 2
                  : shape.y;
              break;
            case 4: // Top
              width = shape.width;
              height = topNewHeight >= 1 ? topNewHeight : shape.height;
              newX = shape.x;
              newY = topNewHeight >= 1 ? dragY + height / 2 : shape.y;
              break;
            case 5: // Right
              width = rightNewWidth >= 1 ? rightNewWidth : shape.width;
              height = shape.height;
              newX =
                rightNewWidth >= 1
                  ? shape.x + (width - old_width) / 2
                  : shape.x;
              newY = shape.y;
              break;
            case 6: // Bottom
              width = shape.width;
              height = bottomNewHeight >= 1 ? bottomNewHeight : shape.height;
              newX = shape.x;
              newY =
                bottomNewHeight >= 1
                  ? shape.y + (height - old_height) / 2
                  : shape.y;
              break;
            case 7: // Left
              width = leftNewWidth >= 1 ? leftNewWidth : shape.width;
              height = shape.height;
              newX = leftNewWidth >= 1 ? dragX + width / 2 : shape.x;
              newY = shape.y;
              break;
          }

          shape.setSize(width, height);
          shape.setPosition(newX, newY);
          this.updateResizeHandles(shape);
          this.rotationKnob.setPosition(
            shape.getTopCenter().x +
              ROTATION_KNOB_RADIUS * Math.cos(shape.rotation - Math.PI / 2),
            shape.getTopCenter().y +
              ROTATION_KNOB_RADIUS * Math.sin(shape.rotation - Math.PI / 2),
          );
        }
      });

      resizeHandle.on("dragend", () => {
        this.resizing = false;
        this.resizeEdge = null;
      });

      this.resizeHandles.push(resizeHandle);
    }
  }

  /**
   * Hides the resize handles
   * @public
   * @returns {void}
   */
  hideResizeHandles() {
    for (let i = 0; i < this.resizeHandles.length; i++) {
      const handle = this.resizeHandles[i];
      handle.destroy();
    }
    this.resizeHandles = [];
  }

  /**
   * Updates the resize handles
   * @param {Phaser.GameObjects.Shape} shape - Shape to update resize handles for
   * @public
   * @returns {void}
   */
  updateResizeHandles(shape) {
    const bottomLeft = shape.getBottomLeft();
    const bottomRight = shape.getBottomRight();
    const topLeft = shape.getTopLeft();
    const topRight = shape.getTopRight();
    const topCenter = shape.getTopCenter();
    const bottomCenter = shape.getBottomCenter();
    const leftCenter = shape.getLeftCenter();
    const rightCenter = shape.getRightCenter();
    const handles = [
      {
        x: topLeft.x,
        y: topLeft.y,
        width: 10,
        height: 10,
      }, // Top-left
      {
        x: topRight.x,
        y: topRight.y,
        width: 10,
        height: 10,
      }, // Top-right
      {
        x: bottomRight.x,
        y: bottomRight.y,
        width: 10,
        height: 10,
      }, // Bottom-right
      {
        x: bottomLeft.x,
        y: bottomLeft.y,
        width: 10,
        height: 10,
      }, // Bottom-left
      {
        x: topCenter.x,
        y: topCenter.y,
        width: shape.width - 10,
        height: 2,
      }, // Top
      {
        x: rightCenter.x,
        y: rightCenter.y,
        width: 2,
        height: shape.height - 10,
      }, // Right
      {
        x: bottomCenter.x,
        y: bottomCenter.y,
        width: shape.width - 10,
        height: 2,
      }, // Bottom
      {
        x: leftCenter.x,
        y: leftCenter.y,
        width: 2,
        height: shape.height - 10,
      }, // Left
    ];

    for (let i = 0; i < this.resizeHandles.length; i++) {
      const handle = this.resizeHandles[i];
      handle.setPosition(handles[i].x, handles[i].y);
      handle.setSize(handles[i].width, handles[i].height);
      handle.setRotation(shape.rotation);
    }
  }
}

export { Editor };
