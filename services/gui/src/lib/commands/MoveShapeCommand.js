import BaseCommand from "@commands/BaseCommand";

/**
 * MoveShapeCommand class
 * This command moves a shape to a new position in the scene.
 */
class MoveShapeCommand extends BaseCommand {
  /**
   * The shape to be moved.
   * @type {Phaser.GameObjects.Shape}
   */
  #shape;

  /**
   * The old position of the shape.
   * @type {Object}
   */
  #oldPosition;

  /**
   * The new position of the shape.
   * @type {Object}
   */
  #newPosition;

  /**
   * Creates an instance of MoveShapeCommand.
   * @param {Phaser.GameObjects.Shape} shape - The shape to be moved.
   * @param {Object} oldPosition - The old position of the shape.
   * @param {number} oldPosition.x - The old x position.
   * @param {number} oldPosition.y - The old y position.
   * @param {Object} newPosition - The new position of the shape.
   * @param {number} newPosition.x - The new x position.
   * @param {number} newPosition.y - The new y position.
   */
  constructor(shape, oldPosition, newPosition) {
    super();
    this.#shape = shape;
    this.#oldPosition = oldPosition;
    this.#newPosition = newPosition;
  }

  /**
   * Executes the command to move the shape to the new position.
   * @returns {Promise<void>}
   */
  async execute() {
    this.#shape.setPosition(this.#newPosition.x, this.#newPosition.y);
  }

  /**
   * Undoes the command by moving the shape back to the old position.
   * @returns {Promise<void>}
   */
  async undo() {
    this.#shape.setPosition(this.#oldPosition.x, this.#oldPosition.y);
  }
}

export default MoveShapeCommand;
