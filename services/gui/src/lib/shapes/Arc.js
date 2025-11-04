import Phaser from "phaser";
import { getRealDimensions, getRealPosition } from "@utils/shapes";

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
   * @param {boolean} [anticlockwise=false] - Whether the arc is drawn in an anti-clockwise direction.
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
    anticlockwise = false,
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
      anticlockwise,
      color,
      alpha,
    );
    this.scene.add.existing(this);
  }

  /**
   * Creates a snapshot of the arc's current state.
   * @returns {Object} An object representing the snapshot of the arc.
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
        radius: this.radius,
        startAngle: this.startAngle,
        endAngle: this.endAngle,
        anticlockwise: this.anticlockwise,
        color: this.fillColor,
        alpha: this.alpha,
      },
      metadata: {
        type: "arc",
        ...this.metadata,
      },
      additionalData: {
        interactive: this.input?.enabled ? this.interactiveData : null,
        managers: this.managers || [],
      },
    };
  }
}

export default Arc;
