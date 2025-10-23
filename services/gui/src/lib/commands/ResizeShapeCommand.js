import BaseCommand from "@commands/BaseCommand";

/**
 * ResizeShapeCommand class
 * This command resizes a shape.
 */
class ResizeShapeCommand extends BaseCommand {
  /**
   * The shape manager to manage shapes in the scene.
   * @type {ShapeManager}
   */
  #shapeManager;

  /**
   * The ID of the shape to resize.
   * @type {string}
   */
  #shapeId;

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
   * @param {ShapeManager} shapeManager - The shape manager to manage shapes in the scene.
   * @param {string} shapeId - The ID of the shape to resize.
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
  constructor(shapeManager, shapeId, oldTransform, newTransform) {
    super();
    this.#shapeManager = shapeManager;
    this.#shapeId = shapeId;
    this.#oldTransform = oldTransform;
    this.#newTransform = newTransform;
  }

  /**
   * Executes the command to resize the shape to the new transformation.
   * @returns {Promise<void>}
   */
  async execute() {
    const shape = this.#shapeManager.getShapeById(this.#shapeId);
    if (!shape) {
      console.warn(`Shape with ID '${this.#shapeId}' does not exist.`);
      return;
    }
    shape.setPosition(this.#newTransform.x, this.#newTransform.y);
    shape.setDisplaySize(this.#newTransform.width, this.#newTransform.height);
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
    shape.setPosition(this.#oldTransform.x, this.#oldTransform.y);
    shape.setDisplaySize(this.#oldTransform.width, this.#oldTransform.height);
  }
}

export default ResizeShapeCommand;
