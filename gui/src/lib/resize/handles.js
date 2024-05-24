import Phaser from "phaser";
import HANDLE_POSITION from "./HandlePosition";
import { getResizedPoints } from "./math";
import { getShapePoints } from "../functions/shapes";
import { updateRotationKnob } from "../rotation/rotationKnob";

/**
 * Size of the handles
 * @memberof module:resize
 * @type {number}
 */
const HANDLE_SIZE = 10;

/**
 * @memberof module:resize
 * @typedef {Object} Handle
 * @property {number} x - The x coordinate
 * @property {number} y - The y coordinate
 * @property {number} width - The width
 * @property {number} height - The height
 * @property {HANDLE_POSITION} position - The position of the handle
 */

/**
 * @typedef {Object} HandlePositions
 * @property {Handle} TOP_LEFT - The top left handle
 * @property {Handle} TOP_RIGHT - The top right handle
 * @property {Handle} BOTTOM_RIGHT - The bottom right handle
 * @property {Handle} BOTTOM_LEFT - The bottom left handle
 * @property {Handle} TOP_CENTER - The top center handle
 * @property {Handle} RIGHT_CENTER - The right center handle
 * @property {Handle} BOTTOM_CENTER - The bottom center handle
 * @property {Handle} LEFT_CENTER - The left center handle
 * @memberof module:types
 */

/**
 * Manage resizing of shapes
 * @memberof module:resize
 * @class ResizeManager
 */
class ResizeManager {
  /**
   * The resize handles
   * @type {Object}
   * @private
   * @default {}
   */
  resizeHandles = {};

  /**
   * Flag to indicate if the shape is being resized
   * @type {boolean}
   * @default false
   */
  resizing = false;

  /**
   * Edge being resized
   * @type {number}
   * @default null
   */
  resizeEdge = null;

  /**
   * Constructor for ResizeManager
   * @param {Phaser.Scene} scene - The scene
   */
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Construct the handles for a shape
   * @param {Phaser.GameObjects.Shape} shape - The shape to construct the handles for
   * @returns {HandlePositions} The handles
   */
  constructHandles(shape) {
    const positions = {
      TOP_LEFT: {
        position: HANDLE_POSITION.TOP_LEFT,
        point: shape.getTopLeft(),
      },
      TOP_RIGHT: {
        position: HANDLE_POSITION.TOP_RIGHT,
        point: shape.getTopRight(),
      },
      BOTTOM_RIGHT: {
        position: HANDLE_POSITION.BOTTOM_RIGHT,
        point: shape.getBottomRight(),
      },
      BOTTOM_LEFT: {
        position: HANDLE_POSITION.BOTTOM_LEFT,
        point: shape.getBottomLeft(),
      },
      TOP_CENTER: {
        position: HANDLE_POSITION.TOP_CENTER,
        point: shape.getTopCenter(),
      },
      RIGHT_CENTER: {
        position: HANDLE_POSITION.RIGHT_CENTER,
        point: shape.getRightCenter(),
      },
      BOTTOM_CENTER: {
        position: HANDLE_POSITION.BOTTOM_CENTER,
        point: shape.getBottomCenter(),
      },
      LEFT_CENTER: {
        position: HANDLE_POSITION.LEFT_CENTER,
        point: shape.getLeftCenter(),
      },
    };

    Object.keys(positions).forEach((key) => {
      const handle = positions[key];
      handle.x = handle.point.x;
      handle.y = handle.point.y;
      handle.width = HANDLE_SIZE;
      handle.height = HANDLE_SIZE;
      delete handle.point;
    });

    return positions;
  }

  /**
   * Handle the drag event for resizing
   * @param {number} dragX - The x coordinate of the drag
   * @param {number} dragY - The y coordinate of the drag
   * @param {Phaser.GameObjects.Shape} shape - The shape to resize
   * @param {Phaser.GameObjects.Shape} rotationKnob - The rotation knob
   * @returns {void}
   */
  handleResizeDrag(dragX, dragY, shape, rotationKnob = null) {
    if (this.scene.currentTool !== "select") {
      return;
    }

    const expectedCornerPointAfterResize = {
      x: dragX,
      y: dragY,
    };
    const points = getShapePoints(shape);

    let newDimensions, line, adjustedCornerPoint;

    switch (this.resizeEdge) {
      case HANDLE_POSITION.TOP_LEFT:
        newDimensions = getResizedPoints(
          points.bottomRight,
          expectedCornerPointAfterResize,
          shape.rotation,
        );
        break;
      case HANDLE_POSITION.TOP_RIGHT:
        newDimensions = getResizedPoints(
          points.bottomLeft,
          expectedCornerPointAfterResize,
          shape.rotation,
        );
        break;
      case HANDLE_POSITION.BOTTOM_RIGHT:
        newDimensions = getResizedPoints(
          points.topLeft,
          expectedCornerPointAfterResize,
          shape.rotation,
        );
        break;
      case HANDLE_POSITION.BOTTOM_LEFT:
        newDimensions = getResizedPoints(
          points.topRight,
          expectedCornerPointAfterResize,
          shape.rotation,
        );
        break;
      case HANDLE_POSITION.TOP_CENTER:
        line = new Phaser.Geom.Line(
          points.bottomCenter.x,
          points.bottomCenter.y,
          points.topCenter.x,
          points.topCenter.y,
        );
        adjustedCornerPoint = Phaser.Geom.Line.GetNearestPoint(
          line,
          expectedCornerPointAfterResize,
        );
        newDimensions = getResizedPoints(
          points.bottomCenter,
          adjustedCornerPoint,
          shape.rotation,
          { width: shape.width },
        );
        break;
      case HANDLE_POSITION.RIGHT_CENTER:
        line = new Phaser.Geom.Line(
          points.leftCenter.x,
          points.leftCenter.y,
          points.rightCenter.x,
          points.rightCenter.y,
        );
        adjustedCornerPoint = Phaser.Geom.Line.GetNearestPoint(
          line,
          expectedCornerPointAfterResize,
        );
        newDimensions = getResizedPoints(
          points.leftCenter,
          adjustedCornerPoint,
          shape.rotation,
          { height: shape.height },
        );
        break;
      case HANDLE_POSITION.BOTTOM_CENTER:
        line = new Phaser.Geom.Line(
          points.topCenter.x,
          points.topCenter.y,
          points.bottomCenter.x,
          points.bottomCenter.y,
        );
        adjustedCornerPoint = Phaser.Geom.Line.GetNearestPoint(
          line,
          expectedCornerPointAfterResize,
        );
        newDimensions = getResizedPoints(
          points.topCenter,
          adjustedCornerPoint,
          shape.rotation,
          { width: shape.width },
        );
        break;
      case HANDLE_POSITION.LEFT_CENTER:
        line = new Phaser.Geom.Line(
          points.rightCenter.x,
          points.rightCenter.y,
          points.leftCenter.x,
          points.leftCenter.y,
        );
        adjustedCornerPoint = Phaser.Geom.Line.GetNearestPoint(
          line,
          expectedCornerPointAfterResize,
        );
        newDimensions = getResizedPoints(
          points.rightCenter,
          adjustedCornerPoint,
          shape.rotation,
          { height: shape.height },
        );
        break;
    }

    shape.setSize(newDimensions.width, newDimensions.height);
    shape.setPosition(newDimensions.x, newDimensions.y);
    this.updateResizeHandles(shape, this.resizeHandles);
    if (!rotationKnob) {
      return;
    }

    updateRotationKnob(shape, rotationKnob);
  }

  /**
   * Creates a single resize handle
   * @param {Handle} handle - Handle object containing the position and dimensions of the handle
   * @param {string} cursor - Cursor style for the handle
   * @param {Phaser.GameObjects.Shape} shape - Shape to resize
   * @returns {Phaser.GameObjects.Rectangle} The resize handle
   * @private
   */
  #createResizeHandle(handle, cursor, shape) {
    const resizeHandle = this.scene.add
      .rectangle(handle.x, handle.y, handle.width, handle.height, 0x888888)
      .setInteractive({ cursor: cursor, draggable: true });
    resizeHandle.setRotation(shape.rotation);

    resizeHandle.on("dragstart", () => {
      this.resizing = true;
      this.resizeEdge = handle.position;
    });

    resizeHandle.on("drag", (_, dragX, dragY) => {
      this.handleResizeDrag(dragX, dragY, shape, this.scene.rotationKnob);
    });

    resizeHandle.on("dragend", () => {
      this.resizing = false;
      this.resizeEdge = null;
    });

    return resizeHandle;
  }

  /**
   * Updates the resize handles
   * @param {Phaser.GameObjects.Shape} shape - Shape to update resize handles for
   * @param {Object} resizeHandles - Resize handles to update
   * @returns {void}
   */
  updateResizeHandles(shape) {
    const handles = this.constructHandles(shape);

    Object.keys(this.resizeHandles).forEach((key) => {
      const handle = this.resizeHandles[key];
      const new_handle = handles[key];
      handle.setPosition(new_handle.x, new_handle.y);
      handle.setSize(new_handle.width, new_handle.height);
      handle.setRotation(shape.rotation);
    });
  }

  /**
   * Creates resize handles for a shape
   * @param {Phaser.GameObjects.Shape} shape - Shape to create resize handles for
   * @returns {void}
   */
  createResizeHandles(shape) {
    const handles = this.constructHandles(shape);

    const cursorStyles = {
      TOP_LEFT: "nwse-resize",
      TOP_RIGHT: "nesw-resize",
      BOTTOM_RIGHT: "nwse-resize",
      BOTTOM_LEFT: "nesw-resize",
      TOP_CENTER: "ns-resize",
      RIGHT_CENTER: "ew-resize",
      BOTTOM_CENTER: "ns-resize",
      LEFT_CENTER: "ew-resize",
    };

    Object.keys(handles).forEach((key) => {
      const handle = handles[key];
      const cursor = cursorStyles[key];
      const resizeHandle = this.#createResizeHandle(handle, cursor, shape);
      this.resizeHandles[key] = resizeHandle;
    });
  }

  /**
   * Hides the resize handles
   * @public
   * @returns {void}
   */
  hideResizeHandles() {
    Object.keys(this.resizeHandles).forEach((key) => {
      const handle = this.resizeHandles[key];
      handle.destroy();
    });
    this.resizeHandles = {};
  }
}

export { ResizeManager };
