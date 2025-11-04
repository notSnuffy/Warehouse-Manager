import BaseCommand from "@commands/BaseCommand";

/**
 * ResizeShapeCommand class
 * This command resizes a shape.
 */
class ResizeShapeCommand extends BaseCommand {
  /**
   * The shape to be resized.
   * @type {Phaser.GameObjects.Shape}
   */
  #shape;

  /**
   * The old transform of the shape.
   * @type {Object}
   * @property {number} x - The old x position of the shape.
   * @property {number} y - The old y position of the shape.
   * @property {number} width - The old width of the shape.
   * @property {number} height - The old height of the shape.
   *
   */
  #oldTransform;

  /**
   * The new transform of the shape.
   * @type {Object}
   * @property {number} x - The new x position of the shape.
   * @property {number} y - The new y position of the shape.
   * @property {number} width - The new width of the shape.
   * @property {number} height - The new height of the shape.
   */
  #newTransform;

  /**
   * Creates an instance of ResizeShapeCommand.
   * @param {Phaser.GameObjects.Shape} shape - The shape to resize.
   * @param {Object} oldTransform - The old position of the shape.
   * @param {number} oldTransform.x - The old x position.
   * @param {number} oldTransform.y - The old y position.
   * @param {number} oldTransform.width - The old width.
   * @param {number} oldTransform.height - The old height.
   * @param {Object} newTransform - The new position of the shape.
   * @param {number} newTransform.x - The new x position.
   * @param {number} newTransform.y - The new y position.
   * @param {number} newTransform.width - The new width.
   * @param {number} newTransform.height - The new height.
   */
  constructor(shape, oldTransform, newTransform) {
    super();
    this.#shape = shape;
    this.#oldTransform = oldTransform;
    this.#newTransform = newTransform;
  }

  /**
   * Executes the command to resize the shape to the new transformation.
   * @returns {Promise<void>}
   */
  async execute() {
    this.#shape.setPosition(this.#newTransform.x, this.#newTransform.y);
    this.#shape.setDisplaySize(
      this.#newTransform.width,
      this.#newTransform.height,
    );
  }

  /**
   * Undoes the command by moving the shape back to the old position.
   * @returns {Promise<void>}
   */
  async undo() {
    this.#shape.setPosition(this.#oldTransform.x, this.#oldTransform.y);
    this.#shape.setDisplaySize(
      this.#oldTransform.width,
      this.#oldTransform.height,
    );
  }
}

export default ResizeShapeCommand;
