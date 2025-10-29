import BaseCommand from "@commands/BaseCommand.js";

/**
 * RemoveShapeCommand class
 * This command removes a shape from the scene.
 */
class RemoveShapeCommand extends BaseCommand {
  /**
   * The shape manager to manage shapes in the scene.
   * @type {ShapeManager}
   */
  #shapeManager;

  /**
   * The ID of the shape to remove.
   * @type {string}
   */
  #shapeId;

  /**
   * The snapshot of the removed shape for undoing the removal.
   * @type {Object|null}
   */
  #snapshot;

  /**
   * Whether to emit events for this command.
   * @type {boolean}
   */
  #emitEvent;

  /**
   * Sets whether to emit events for this command.
   * @param {boolean} value - True to emit events, false otherwise.
   */
  set emitEvent(value) {
    this.#emitEvent = value;
  }

  /**
   * Creates an instance of RemoveShapeCommand.
   * @param {Object} shapeManager - The shape manager to manage shapes in the scene.
   * @param {string} shapeId - The ID of the shape to remove.
   * @param {boolean} [emitEvent=true] - Whether to emit events for this command.
   */
  constructor(shapeManager, shapeId, emitEvent = true) {
    super();
    this.#shapeManager = shapeManager;
    this.#shapeId = shapeId;
    this.#emitEvent = emitEvent;
  }

  /**
   * Executes the command to remove the shape from the scene.
   * @returns {Promise<boolean>}
   */
  async execute() {
    const shape = this.#shapeManager.getShapeById(this.#shapeId);
    if (!shape) {
      console.warn(`Shape with ID '${this.#shapeId}' does not exist.`);
      return;
    }

    this.#snapshot = shape.createSnapshot();
    return this.#shapeManager.removeShapeById(this.#shapeId, this.#emitEvent);
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

    console.log("Restoring shape from snapshot:", this.#snapshot);
    const shape = await this.#shapeManager.addShapeFromSnapshot(
      this.#snapshot,
      this.#emitEvent,
    );
    this.#shapeId = shape.internalId;
  }
}

export default RemoveShapeCommand;
