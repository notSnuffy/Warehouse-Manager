import Phaser from "phaser";

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
}

export default Rectangle;
