import Phaser from "phaser";
import { getRealDimensions, getRealPosition } from "@utils/shapes";

/**
 * Wrapper for Phaser's Ellipse class.
 * @class
 * @extends Phaser.GameObjects.Ellipse
 */
class Ellipse extends Phaser.GameObjects.Ellipse {
  /**
   * Creates an instance of Ellipse.
   * @param {Phaser.Scene} scene - The scene to which this ellipse belongs.
   * @param {number} [x=0] - The x coordinate of the ellipse's position.
   * @param {number} [y=0] - The y coordinate of the ellipse's position.
   * @param {number} [width=128] - The width of the ellipse.
   * @param {number} [height=128] - The height of the ellipse.
   * @param {number} [fillColor=0xffffff] - The color of the ellipse in hexadecimal format.
   * @param {number} [fillAlpha=1] - The alpha (opacity) of the ellipse.
   */
  constructor(
    scene,
    x = 0,
    y = 0,
    width = 128,
    height = 128,
    fillColor = 0xffffff,
    fillAlpha = 1,
  ) {
    super(scene, x, y, width, height, fillColor, fillAlpha);
    this.scene.add.existing(this);
  }

  /**
   * Creates a snapshot of the ellipse's current state.
   * @returns {Object} An object representing the snapshot of the ellipse.
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
      type: "ellipse",
      params: {
        x: position.x,
        y: position.y,
        width: dimensions.width,
        height: dimensions.height,
        rotation: this.rotation,
        color: this.fillColor,
        alpha: this.alpha,
      },
      metadata: {
        ...this.metadata,
      },
      additionalData: {
        id: this.internalId,
        interactive: this.input?.enabled ? this.interactiveData : null,
      },
    };
  }
}

export default Ellipse;
