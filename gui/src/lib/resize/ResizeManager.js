import Phaser from "phaser";
import { getShapePoints } from "../functions/shapes";
import Manager from "../Manager";
import * as Handles from "./handles";
import MoveHandlerVisitor from "./MoveHandlerVisitor";

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
 * @extends Manager
 */
class ResizeManager extends Manager {
  /**
   * The resize handles
   * @type {Object}
   * @private
   * @default {}
   */
  #resizeHandles = {};

  /**
   * Flag to indicate if the shape is being resized
   * @type {boolean}
   * @private
   * @default false
   */
  #resizing = false;

  /**
   * Edge being resized
   * @type {number}
   * @default null
   */
  #resizeEdge = null;

  /**
   * Array of managers that need to be updated when resizing
   * @type {Manager[]}
   * @private
   * @default []
   */
  #managersToUpdate = [];

  previousMousePos = new Phaser.Math.Vector2(0, 0);

  /**
   * Constructor for ResizeManager
   * @param {Phaser.Scene} scene - The scene
   */
  constructor(scene) {
    super(scene);
  }

  /**
   * Add a manager to the list of managers to update
   * @param {Manager} manager - The manager to add
   * @returns {void}
   * @public
   */
  addManagerToUpdate(manager) {
    this.#managersToUpdate.push(manager);
  }

  /**
   * Flag to indicate if an action is active
   * @type {boolean}
   * @readonly
   * @public
   * @returns {boolean} The action active flag
   * @override
   */
  get actionActive() {
    return this.#resizing;
  }

  /**
   * Construct the handles for a shape
   * @param {Phaser.GameObjects.Shape} shape - The shape to construct the handles for
   * @returns {HandlePositions} The handles
   */
  #constructHandles(shape) {
    const points = getShapePoints(shape);

    const handles = {
      TOP_LEFT: {
        handle: new Handles.TopLeftHandle(
          points.topLeft.x,
          points.topLeft.y,
          HANDLE_SIZE,
          HANDLE_SIZE,
        ),
      },
      TOP_RIGHT: {
        handle: new Handles.TopRightHandle(
          points.topRight.x,
          points.topRight.y,
          HANDLE_SIZE,
          HANDLE_SIZE,
        ),
      },
      BOTTOM_RIGHT: {
        handle: new Handles.BottomRightHandle(
          points.bottomRight.x,
          points.bottomRight.y,
          HANDLE_SIZE,
          HANDLE_SIZE,
        ),
      },
      BOTTOM_LEFT: {
        handle: new Handles.BottomLeftHandle(
          points.bottomLeft.x,
          points.bottomLeft.y,
          HANDLE_SIZE,
          HANDLE_SIZE,
        ),
      },
      TOP_CENTER: {
        handle: new Handles.TopCenterHandle(
          points.topCenter.x,
          points.topCenter.y,
          HANDLE_SIZE,
          HANDLE_SIZE,
        ),
      },
      RIGHT_CENTER: {
        handle: new Handles.RightCenterHandle(
          points.rightCenter.x,
          points.rightCenter.y,
          HANDLE_SIZE,
          HANDLE_SIZE,
        ),
      },
      BOTTOM_CENTER: {
        handle: new Handles.BottomCenterHandle(
          points.bottomCenter.x,
          points.bottomCenter.y,
          HANDLE_SIZE,
          HANDLE_SIZE,
        ),
      },
      LEFT_CENTER: {
        handle: new Handles.LeftCenterHandle(
          points.leftCenter.x,
          points.leftCenter.y,
          HANDLE_SIZE,
          HANDLE_SIZE,
        ),
      },
    };

    Object.keys(handles).forEach((key) => {
      const handle = handles[key];
      handle.x = handle.handle.x;
      handle.y = handle.handle.y;
      handle.width = handle.handle.width;
      handle.height = handle.handle.height;
    });

    return handles;
  }

  /**
   * Handle the drag event for resizing
   * @param {number} dragX - The x coordinate of the drag
   * @param {number} dragY - The y coordinate of the drag
   * @param {Phaser.GameObjects.Shape} shape - The shape to resize
   * @returns {void}
   */
  #handleResizeDrag(dragX, dragY, shape) {
    const expectedCornerPointAfterResize = {
      x: dragX,
      y: dragY,
    };
    const points = getShapePoints(shape);

    let moveHandlerVisitor = new MoveHandlerVisitor(
      points,
      expectedCornerPointAfterResize,
      shape.rotation,
    );
    console.log(moveHandlerVisitor);
    const handle = this.#resizeEdge;
    console.log(handle);
    handle.accept(moveHandlerVisitor);
    console.log(moveHandlerVisitor);
    let newDimensions = moveHandlerVisitor.result;

    // switch (this.#resizeEdge) {
    //   case HANDLE_POSITION.TOP_LEFT:
    //     newDimensions = getResizedPoints(
    //       points.bottomRight,
    //       expectedCornerPointAfterResize,
    //       shape.rotation,
    //     );
    //     break;
    //   case HANDLE_POSITION.TOP_RIGHT:
    //     newDimensions = getResizedPoints(
    //       points.bottomLeft,
    //       expectedCornerPointAfterResize,
    //       shape.rotation,
    //     );
    //     break;
    //   case HANDLE_POSITION.BOTTOM_RIGHT:
    //     newDimensions = getResizedPoints(
    //       points.topLeft,
    //       expectedCornerPointAfterResize,
    //       shape.rotation,
    //     );

    //     // let topLeft = points.topLeft;
    //     // let topRight = points.topRight;
    //     // let bottomLeft = points.bottomLeft;
    //     // let bottomRight = points.bottomRight;

    //     // let dirA = new Phaser.Math.Vector2(
    //     //   topRight.x - topLeft.x,
    //     //   topRight.y - topLeft.y,
    //     // );

    //     // let x_delta = 30 / dirA.length();
    //     // x_delta = x_delta * (topLeft.y - topRight.y);
    //     // let y_delta = 30 / dirA.length();
    //     // y_delta = y_delta * (topRight.x - topLeft.x);

    //     // let newTopLeft = new Phaser.Math.Vector2(
    //     //   topLeft.x + x_delta,
    //     //   topLeft.y + y_delta,
    //     // );

    //     // let newTopRight = new Phaser.Math.Vector2(
    //     //   topRight.x + x_delta,
    //     //   topRight.y + y_delta,
    //     // );

    //     // let dirB = new Phaser.Math.Vector2(
    //     //   bottomLeft.x - topLeft.x,
    //     //   bottomLeft.y - topLeft.y,
    //     // );

    //     // x_delta = -30 / dirB.length();
    //     // x_delta = x_delta * (topLeft.y - bottomLeft.y);
    //     // y_delta = -30 / dirB.length();
    //     // y_delta = y_delta * (bottomLeft.x - topLeft.x);

    //     // let newBottomLeft = new Phaser.Math.Vector2(
    //     //   bottomLeft.x + x_delta,
    //     //   bottomLeft.y + y_delta,
    //     // );

    //     // let newTopLeftB = new Phaser.Math.Vector2(
    //     //   topLeft.x + x_delta,
    //     //   topLeft.y + y_delta,
    //     // );

    //     // // Function to get the line equation value at a point (x, y)
    //     // function lineValue(A, B, C, x, y) {
    //     //   return A * x + B * y + C;
    //     // }

    //     // // Get line equation coefficients for lineA (through topLeft and extendedTopRight)
    //     // let A1 = newTopRight.y - newTopLeft.y;
    //     // let B1 = newTopLeft.x - newTopRight.x;
    //     // let C1 = newTopRight.x * newTopLeft.y - newTopLeft.x * newTopRight.y;

    //     // // Get line equation coefficients for lineB (through topLeft and extendedBottomLeft)
    //     // let A2 = newBottomLeft.y - newTopLeft.y;
    //     // let B2 = newTopLeft.x - newBottomLeft.x;
    //     // let C2 =
    //     //   newBottomLeft.x * newTopLeft.y - newTopLeft.x * newBottomLeft.y;

    //     // let currentMousePos = new Phaser.Math.Vector2(dragX, dragY);

    //     // // Calculate line equation values at current mouse position
    //     // let currValueA = lineValue(
    //     //   A1,
    //     //   B1,
    //     //   C1,
    //     //   currentMousePos.x,
    //     //   currentMousePos.y,
    //     // );
    //     // let currValueB = lineValue(
    //     //   A2,
    //     //   B2,
    //     //   C2,
    //     //   currentMousePos.x,
    //     //   currentMousePos.y,
    //     // );

    //     // if (currValueA >= 0 && currValueB < 0) {
    //     //   console.log("Both");
    //     //   return;
    //     // }

    //     // if (currValueA >= 0 || currValueB < 0) {
    //     //   return;
    //     // }

    //     break;
    //   case HANDLE_POSITION.BOTTOM_LEFT:
    //     newDimensions = getResizedPoints(
    //       1,
    //       points.topRight,
    //       expectedCornerPointAfterResize,
    //       shape.rotation,
    //     );
    //     break;
    //   case HANDLE_POSITION.TOP_CENTER:
    //     line = new Phaser.Geom.Line(
    //       points.bottomCenter.x,
    //       points.bottomCenter.y,
    //       points.topCenter.x,
    //       points.topCenter.y,
    //     );
    //     adjustedCornerPoint = Phaser.Geom.Line.GetNearestPoint(
    //       line,
    //       expectedCornerPointAfterResize,
    //     );

    //     newDimensions = getResizedPoints(
    //       0,
    //       points.bottomCenter,
    //       adjustedCornerPoint,
    //       shape.rotation,
    //       { width: shape.width },
    //     );
    //     break;
    //   case HANDLE_POSITION.RIGHT_CENTER:
    //     line = new Phaser.Geom.Line(
    //       points.leftCenter.x,
    //       points.leftCenter.y,
    //       points.rightCenter.x,
    //       points.rightCenter.y,
    //     );
    //     adjustedCornerPoint = Phaser.Geom.Line.GetNearestPoint(
    //       line,
    //       expectedCornerPointAfterResize,
    //     );
    //     newDimensions = getResizedPoints(
    //       points.leftCenter,
    //       adjustedCornerPoint,
    //       shape.rotation,
    //       { height: shape.height },
    //     );
    //     break;
    //   case HANDLE_POSITION.BOTTOM_CENTER:
    //     line = new Phaser.Geom.Line(
    //       points.topCenter.x,
    //       points.topCenter.y,
    //       points.bottomCenter.x,
    //       points.bottomCenter.y,
    //     );
    //     adjustedCornerPoint = Phaser.Geom.Line.GetNearestPoint(
    //       line,
    //       expectedCornerPointAfterResize,
    //     );
    //     newDimensions = getResizedPoints(
    //       points.topCenter,
    //       adjustedCornerPoint,
    //       shape.rotation,
    //       { width: shape.width },
    //     );
    //     break;
    //   case HANDLE_POSITION.LEFT_CENTER:
    //     line = new Phaser.Geom.Line(
    //       points.rightCenter.x,
    //       points.rightCenter.y,
    //       points.leftCenter.x,
    //       points.leftCenter.y,
    //     );
    //     adjustedCornerPoint = Phaser.Geom.Line.GetNearestPoint(
    //       line,
    //       expectedCornerPointAfterResize,
    //     );
    //     newDimensions = getResizedPoints(
    //       points.rightCenter,
    //       adjustedCornerPoint,
    //       shape.rotation,
    //       { height: shape.height },
    //     );
    //     break;
    // }

    console.log(newDimensions);

    if (newDimensions.height < 10 || newDimensions.width < 10) {
      return;
    }
    console.log(newDimensions);
    shape.setSize(newDimensions.width, newDimensions.height);
    shape.setPosition(newDimensions.x, newDimensions.y);
    this.update(shape);
    this.#managersToUpdate.forEach((manager) => {
      manager.update(shape);
    });
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
      this.#resizing = true;
      this.#resizeEdge = handle.handle;
    });

    resizeHandle.on("drag", (_, dragX, dragY) => {
      this.#handleResizeDrag(dragX, dragY, shape);
    });

    resizeHandle.on("dragend", () => {
      this.#resizing = false;
      this.#resizeEdge = null;
    });

    return resizeHandle;
  }

  /**
   * Updates the resize handles
   * @param {Phaser.GameObjects.Shape} shape - Shape to update resize handles for
   * @returns {void}
   */
  update(shape) {
    const handles = this.#constructHandles(shape);

    Object.keys(this.#resizeHandles).forEach((key) => {
      const handle = this.#resizeHandles[key];
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
   * @override
   */
  create(shape) {
    const handles = this.#constructHandles(shape);

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
      this.#resizeHandles[key] = resizeHandle;
    });
  }

  /**
   * Hides the resize handles
   * @public
   * @returns {void}
   * @override
   */
  hide() {
    Object.keys(this.#resizeHandles).forEach((key) => {
      const handle = this.#resizeHandles[key];
      handle.destroy();
    });
    this.#resizeHandles = {};
  }
}

export default ResizeManager;
