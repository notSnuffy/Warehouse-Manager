import BaseCommand from "@commands/BaseCommand.js";

/**
 * RemoveShapeCommand class
 * This command removes a shape from the scene.
 */
class RemoveShapeCommand extends BaseCommand {
  #shapeManager;
  #shapeId;
  #snapshot;

  /**
   * Creates an instance of RemoveShapeCommand.
   * @param {Object} shapeManager - The shape manager to manage shapes in the scene.
   * @param {string} shapeId - The ID of the shape to remove.
   */
  constructor(shapeManager, shapeId) {
    super();
    this.#shapeManager = shapeManager;
    this.#shapeId = shapeId;
  }

  /**
   * Executes the command to remove the shape from the scene.
   * @returns {Promise<void>}
   */
  async execute() {
    const shape = this.#shapeManager.getShapeById(this.#shapeId);
    if (!shape) {
      console.warn(`Shape with ID '${this.#shapeId}' does not exist.`);
      return;
    }

    this.#snapshot = shape.createSnapshot();
    this.#shapeManager.removeShapeById(this.#shapeId);
  }

  /**
   * Undoes the command by re-adding the removed shape to the scene.
   * @returns {Promise<void>}
   */
  async undo() {
    if (!this.#snapshot) {
      console.warn("No shape to re-add.");
      return;
    }

    const shape = await this.#shapeManager.addShapeFromSnapshot(this.#snapshot);
    this.#shapeId = shape.internalId;
  }
}

export default RemoveShapeCommand;
