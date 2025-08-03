import Phaser from "phaser";

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
}

export default Polygon;
