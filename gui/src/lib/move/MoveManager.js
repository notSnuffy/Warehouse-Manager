import Manager from "../Manager";
import { getShapePoints } from "../functions/shapes";

/**
 * Manage the movement of shapes
 * @memberof module:move
 * @class MoveManager
 * @extends Manager
 */
class MoveManager extends Manager {
  /**
   * Constructor
   * @param {Phaser.Scene} scene - The scene
   * @constructor
   * @public
   */
  constructor(scene) {
    super(scene);
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
    return this.scene.activeTool === "move";
  }

  /**
   * Adds shape drag event
   * @param {Phaser.GameObjects.Shape} shape - Shape to add drag event to
   * @returns {void}
   * @public
   * @override
   */
  create(shape) {
    shape.on("drag", (_, dragX, dragY) => {
      if (this.scene.activeTool === "move") {
        const points = Object.values(getShapePoints(shape));

        const minX = points.reduce(
          (acc, point) => Math.min(acc, point.x),
          points[0].x,
        );
        const maxX = points.reduce(
          (acc, point) => Math.max(acc, point.x),
          points[0].x,
        );
        const minY = points.reduce(
          (acc, point) => Math.min(acc, point.y),
          points[0].y,
        );
        const maxY = points.reduce(
          (acc, point) => Math.max(acc, point.y),
          points[0].y,
        );

        const topHeightFromCenter = shape.y - minY;
        const bottomHeightFromCenter = maxY - shape.y;
        const leftWidthFromCenter = shape.x - minX;
        const rightWidthFromCenter = maxX - shape.x;

        const leftSideWithinBounds = dragX >= leftWidthFromCenter;
        const rightSideWithinBounds =
          dragX + rightWidthFromCenter <= this.scene.cameras.main.width;
        const topSideWithinBounds = dragY >= topHeightFromCenter;
        const bottomSideWithinBounds =
          dragY + bottomHeightFromCenter <= this.scene.cameras.main.height;

        const withinBounds =
          leftSideWithinBounds &&
          rightSideWithinBounds &&
          topSideWithinBounds &&
          bottomSideWithinBounds;

        if (withinBounds) {
          shape.setPosition(dragX, dragY);
        }
      }
    });
  }

  /**
   * Update method
   * @param {Phaser.GameObjects.Shape} shape - The shape to update event for
   * @returns {void}
   * @public
   * @override
   */
  update() {
    return;
  }

  /**
   * Hide method
   * @returns {void}
   * @public
   * @override
   */
  hide() {
    return;
  }
}

export default MoveManager;
