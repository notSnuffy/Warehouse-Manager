import Phaser from "phaser";
import { getRealDimensions, getRealPosition } from "@utils/shapes";

/**
 * Wrapper for Phaser's Polygon class.
 * @class
 * @extends Phaser.GameObjects.Polygon
 */
class Polygon extends Phaser.GameObjects.Polygon {
  /**
   * Creates an instance of Polygon.
   * @param {Phaser.Scene} scene - The scene to which this polygon belongs.
   * @param {number} [x=0] - The x coordinate of the polygon's position.
   * @param {number} [y=0] - The y coordinate of the polygon's position.
   * @param {Phaser.Geom.Polygon|Array} [points=[]] - The points that define the polygon.
   * @param {number} [fillColor=0xffffff] - The color of the polygon in hexadecimal format.
   * @param {number} [fillAlpha=1] - The alpha (opacity) of the polygon.
   */
  constructor(
    scene,
    x = 0,
    y = 0,
    points = [],
    fillColor = 0xffffff,
    fillAlpha = 1,
  ) {
    super(scene, x, y, points, fillColor, fillAlpha);
    this.scene.add.existing(this);
  }

  /**
   * Creates a snapshot of the polygon's current state.
   * @returns {Object} An object representing the snapshot of the polygon.
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
        points: this.pathData.slice(0, -2),
        color: this.fillColor,
        alpha: this.alpha,
      },

      metadata: {
        type: "polygon",
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

export default Polygon;
