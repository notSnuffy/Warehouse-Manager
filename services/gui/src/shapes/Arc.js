import Phaser from "phaser";

/**
 * Wrapper for Phaser's Arc class.
 * @class
 * @extends Phaser.GameObjects.Arc
 */
class Arc extends Phaser.GameObjects.Arc {
  /**
   * Creates an instance of Arc.
   * @param {Phaser.Scene} scene - The scene to which this arc belongs.
   * @param {number} [x=0] - The x-coordinate of the arc's center.
   * @param {number} [y=0] - The y-coordinate of the arc's center.
   * @param {number} [radius=128] - The radius of the arc.
   * @param {number} [startAngle=0] - The starting angle of the arc in degrees.
   * @param {number} [endAngle=360] - The ending angle of the arc in degrees.
   * @param {boolean} [antiClockwise=false] - Whether the arc is drawn in an anti-clockwise direction.
   * @param {number} [color=0xffffff] - The color of the arc.
   * @param {number} [alpha=1] - The alpha value of the arc.
   */
  constructor(
    scene,
    x = 0,
    y = 0,
    radius = 128,
    startAngle = 0,
    endAngle = 360,
    antiClockwise = false,
    color = 0xffffff,
    alpha = 1,
  ) {
    super(
      scene,
      x,
      y,
      radius,
      startAngle,
      endAngle,
      antiClockwise,
      color,
      alpha,
    );
    this.scene.add.existing(this);
  }
}

export default Arc;
