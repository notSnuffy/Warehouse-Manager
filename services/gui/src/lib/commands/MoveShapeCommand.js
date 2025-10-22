import BaseCommand from "@commands/BaseCommand";

/**
 * MoveShapeCommand class
 * This command moves a shape to a new position in the scene.
 */
class MoveShapeCommand extends BaseCommand {
  /**
   * The shape manager to manage shapes in the scene.
   * @type {ShapeManager}
   */
  #shapeManager;

  /**
   * The ID of the shape to move.
   * @type {string}
   */
  #shapeId;

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
   * @param {ShapeManager} shapeManager - The shape manager to manage shapes in the scene.
   * @param {string} shapeId - The ID of the shape to move.
   * @param {Object} oldPosition - The old position of the shape.
   * @param {number} oldPosition.x - The old x position.
   * @param {number} oldPosition.y - The old y position.
   * @param {Object} newPosition - The new position of the shape.
   * @param {number} newPosition.x - The new x position.
   * @param {number} newPosition.y - The new y position.
   */
  constructor(shapeManager, shapeId, oldPosition, newPosition) {
    super();
    this.#shapeManager = shapeManager;
    this.#shapeId = shapeId;
    this.#oldPosition = oldPosition;
    this.#newPosition = newPosition;
  }

  /**
   * Executes the command to move the shape to the new position.
   * @returns {Promise<void>}
   */
  async execute() {
    const shape = this.#shapeManager.getShapeById(this.#shapeId);
    if (!shape) {
      console.warn(`Shape with ID '${this.#shapeId}' does not exist.`);
      return;
    }
    shape.setPosition(this.#newPosition.x, this.#newPosition.y);
  }

  /**
   * Undoes the command by moving the shape back to the old position.
   * @returns {Promise<void>}
   */
  async undo() {
    const shape = this.#shapeManager.getShapeById(this.#shapeId);
    if (!shape) {
      console.warn(`Shape with ID '${this.#shapeId}' does not exist.`);
      return;
    }
    shape.setPosition(this.#oldPosition.x, this.#oldPosition.y);
  }
}

export default MoveShapeCommand;
