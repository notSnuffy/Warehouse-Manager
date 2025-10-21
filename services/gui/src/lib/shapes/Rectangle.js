import Phaser from "phaser";
import { getRealDimensions, getRealPosition } from "@utils/shapes";

/**
 * Wrapper for Phaser's Rectangle class.
 * @class
 * @extends Phaser.GameObjects.Rectangle
 */
class Rectangle extends Phaser.GameObjects.Rectangle {
  /**
   * Creates an instance of Rectangle.
   * @param {Phaser.Scene} scene - The scene to which this rectangle belongs.
   * @param {number} x - The x coordinate of the rectangle's position.
   * @param {number} y - The y coordinate of the rectangle's position.
   * @param {number} [width=128] - The width of the rectangle.
   * @param {number} [height=128] - The height of the rectangle.
   * @param {number} [color=0xffffff] - The color of the rectangle in hexadecimal format.
   * @param {number} [alpha=1] - The alpha (opacity) of the rectangle.
   */
  constructor(
    scene,
    x,
    y,
    width = 128,
    height = 128,
    color = 0xffffff,
    alpha = 1,
  ) {
    super(scene, x, y, width, height, color, alpha);
    this.scene.add.existing(this);
  }

  /**
   * Creates a snapshot of the rectangle's current state.
   * @returns {Object} An object representing the snapshot of the rectangle.
   */
  createSnapshot() {
    let position;
    let dimensions;
    if (this.parentContainer) {
      position = getRealPosition(this, this.parentContainer);
      dimensions = getRealDimensions(this);
    } else {
      position = { x: this.x, y: this.y };
      dimensions = {
        width: this.displayWidth,
        height: this.displayHeight,
      };
    }

    return {
      transform: {
        x: position.x,
        y: position.y,
        width: dimensions.width,
        height: dimensions.height,
        rotation: this.rotation,
      },
      specific: {
        color: this.fillColor,
        alpha: this.alpha,
      },
      metadata: {
        type: "rectangle",
        ...this.metadata,
      },
      additionalData: {
        id: this.internalId,
        interactive: this.input?.enabled ? this.interactiveData : null,
        managers: this.managers || [],
      },
    };
  }
}

export default Rectangle;
