import BaseCommand from "@commands/BaseCommand";

/**
 * RotateShapeCommand class
 * This command rotates a shape to a new rotation in the scene.
 */
class RotateShapeCommand extends BaseCommand {
  /**
   * The shape manager to manage shapes in the scene.
   * @type {ShapeManager}
   */
  #shapeManager;

  /**
   * The ID of the shape to rotate.
   * @type {string}
   */
  #shapeId;

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
   * @param {ShapeManager} shapeManager - The shape manager to manage shapes in the scene.
   * @param {string} shapeId - The ID of the shape to rotate.
   * @param {number} oldRotation - The old rotation of the shape.
   * @param {number} newRotation - The new rotation of the shape.
   */
  constructor(shapeManager, shapeId, oldRotation, newRotation) {
    super();
    this.#shapeManager = shapeManager;
    this.#shapeId = shapeId;
    this.#oldRotation = oldRotation;
    this.#newRotation = newRotation;
  }

  /**
   * Executes the command to rotate the shape to the new rotation.
   * @returns {Promise<void>}
   */
  async execute() {
    const shape = this.#shapeManager.getShapeById(this.#shapeId);
    if (!shape) {
      console.warn(`Shape with ID '${this.#shapeId}' does not exist.`);
      return;
    }
    shape.setRotation(this.#newRotation);
  }

  /**
   * Undoes the command to revert the shape to the old rotation.
   * @returns {Promise<void>}
   */
  async undo() {
    const shape = this.#shapeManager.getShapeById(this.#shapeId);
    if (!shape) {
      console.warn(`Shape with ID '${this.#shapeId}' does not exist.`);
      return;
    }
    shape.setRotation(this.#oldRotation);
  }
}

export default RotateShapeCommand;
