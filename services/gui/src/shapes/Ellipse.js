import Phaser from "phaser";

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
}

export default Ellipse;
