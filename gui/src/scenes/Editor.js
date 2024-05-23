import Phaser from "phaser";
import {
  getResizedPoints,
  Corner,
  Edge,
  constructHandles,
} from "../Math/Resize";

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
          ROTATION_KNOB_RADIUS * 2 * Math.cos(shape.rotation - Math.PI / 2),
        shape.getTopCenter().y +
          ROTATION_KNOB_RADIUS * 2 * Math.sin(shape.rotation - Math.PI / 2),
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
        ROTATION_KNOB_RADIUS * 2 * Math.cos(shape.rotation - Math.PI / 2),
      shape.getTopCenter().y +
        ROTATION_KNOB_RADIUS * 2 * Math.sin(shape.rotation - Math.PI / 2),
    );
  }

  /**
   * Creates resize handles for a shape
   * @param {Phaser.GameObjects.Shape} shape - Shape to create resize handles for
   * @public
   * @returns {void}
   */
  createResizeHandles(shape) {
    const handles = constructHandles(shape);

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
        this.resizeEdge = handle.position;
      });

      resizeHandle.on("drag", (_, dragX, dragY) => {
        if (this.currentTool === "select") {
          const expectedCornerPointAfterResize = {
            x: dragX,
            y: dragY,
          };

          const topLeft = shape.getTopLeft();
          const topRight = shape.getTopRight();
          const bottomLeft = shape.getBottomLeft();
          const bottomRight = shape.getBottomRight();
          const leftCenter = shape.getLeftCenter();
          const rightCenter = shape.getRightCenter();
          const topCenter = shape.getTopCenter();
          const bottomCenter = shape.getBottomCenter();

          let newDimensions, line, adjustedCornerPoint;

          switch (this.resizeEdge) {
            case Corner.TOP_LEFT:
              newDimensions = getResizedPoints(
                bottomRight,
                expectedCornerPointAfterResize,
                shape.rotation,
              );
              break;
            case Corner.TOP_RIGHT:
              newDimensions = getResizedPoints(
                bottomLeft,
                expectedCornerPointAfterResize,
                shape.rotation,
              );
              break;
            case Corner.BOTTOM_RIGHT:
              newDimensions = getResizedPoints(
                topLeft,
                expectedCornerPointAfterResize,
                shape.rotation,
              );
              break;
            case Corner.BOTTOM_LEFT:
              newDimensions = getResizedPoints(
                topRight,
                expectedCornerPointAfterResize,
                shape.rotation,
              );
              break;
            case Edge.TOP:
              line = new Phaser.Geom.Line(
                bottomCenter.x,
                bottomCenter.y,
                topCenter.x,
                topCenter.y,
              );
              adjustedCornerPoint = Phaser.Geom.Line.GetNearestPoint(
                line,
                expectedCornerPointAfterResize,
              );
              newDimensions = getResizedPoints(
                bottomCenter,
                adjustedCornerPoint,
                shape.rotation,
                { width: shape.width },
              );
              break;
            case Edge.RIGHT:
              line = new Phaser.Geom.Line(
                leftCenter.x,
                leftCenter.y,
                rightCenter.x,
                rightCenter.y,
              );
              adjustedCornerPoint = Phaser.Geom.Line.GetNearestPoint(
                line,
                expectedCornerPointAfterResize,
              );
              newDimensions = getResizedPoints(
                leftCenter,
                adjustedCornerPoint,
                shape.rotation,
                { height: shape.height },
              );
              break;
            case Edge.BOTTOM:
              line = new Phaser.Geom.Line(
                topCenter.x,
                topCenter.y,
                bottomCenter.x,
                bottomCenter.y,
              );
              adjustedCornerPoint = Phaser.Geom.Line.GetNearestPoint(
                line,
                expectedCornerPointAfterResize,
              );
              newDimensions = getResizedPoints(
                topCenter,
                adjustedCornerPoint,
                shape.rotation,
                { width: shape.width },
              );
              break;
            case Edge.LEFT:
              line = new Phaser.Geom.Line(
                rightCenter.x,
                rightCenter.y,
                leftCenter.x,
                leftCenter.y,
              );
              adjustedCornerPoint = Phaser.Geom.Line.GetNearestPoint(
                line,
                expectedCornerPointAfterResize,
              );
              newDimensions = getResizedPoints(
                rightCenter,
                adjustedCornerPoint,
                shape.rotation,
                { height: shape.height },
              );
              break;
          }

          shape.setSize(newDimensions.width, newDimensions.height);
          shape.setPosition(newDimensions.x, newDimensions.y);
          this.updateResizeHandles(shape);
          this.rotationKnob.setPosition(
            shape.getTopCenter().x +
              ROTATION_KNOB_RADIUS * 2 * Math.cos(shape.rotation - Math.PI / 2),
            shape.getTopCenter().y +
              ROTATION_KNOB_RADIUS * 2 * Math.sin(shape.rotation - Math.PI / 2),
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
    const handles = constructHandles(shape);

    for (let i = 0; i < this.resizeHandles.length; i++) {
      const handle = this.resizeHandles[i];
      handle.setPosition(handles[i].x, handles[i].y);
      handle.setSize(handles[i].width, handles[i].height);
      handle.setRotation(shape.rotation);
    }
  }
}

export { Editor };
