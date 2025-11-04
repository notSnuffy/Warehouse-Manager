import BaseCommand from "@commands/BaseCommand";

/**
 * RotateShapeCommand class
 * This command rotates a shape to a new rotation in the scene.
 */
class RotateShapeCommand extends BaseCommand {
  /**
   * The shape to rotate.
   * @type {Phaser.GameObjects.Shape}
   */
  #shape;

  /**
   * The old rotation of the shape.
   * @type {Object}
   */
  #oldRotation;

  /**
   * The new rotation of the shape.
   * @type {Object}
   */
  #newRotation;

  /**
   * Creates an instance of RotateShapeCommand.
   * @param {Phaser.GameObjects.Shape} shape - The shape to rotate.
   * @param {number} oldRotation - The old rotation of the shape.
   * @param {number} newRotation - The new rotation of the shape.
   */
  constructor(shape, oldRotation, newRotation) {
    super();
    this.#shape = shape;
    this.#oldRotation = oldRotation;
    this.#newRotation = newRotation;
  }

  /**
   * Executes the command to rotate the shape to the new rotation.
   * @returns {Promise<void>}
   */
  async execute() {
    this.#shape.setRotation(this.#newRotation);
  }

  /**
   * Undoes the command to revert the shape to the old rotation.
   * @returns {Promise<void>}
   */
  async undo() {
    this.#shape.setRotation(this.#oldRotation);
  }
}

export default RotateShapeCommand;
