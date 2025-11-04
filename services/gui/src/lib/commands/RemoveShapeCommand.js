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
   * The shape to be removed.
   * @type {Phaser.GameObjects.Shape}
   */
  #shape;

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
   * @param {Phaser.GameObjects.Shape} shape - The shape to be removed.
   * @param {boolean} [emitEvent=true] - Whether to emit events for this command.
   */
  constructor(shapeManager, shape, emitEvent = true) {
    super();
    this.#shapeManager = shapeManager;
    this.#shape = shape;
    this.#emitEvent = emitEvent;
  }

  /**
   * Executes the command to remove the shape from the scene.
   * @returns {Promise<boolean>}
   */
  async execute() {
    return this.#shapeManager.removeShape(this.#shape, this.#emitEvent);
  }

  /**
   * Undoes the command by re-adding the removed shape to the scene.
   * @returns {Promise<void>}
   */
  async undo() {
    await this.#shapeManager.addExistingShape(this.#shape, this.#emitEvent);
  }
}

export default RemoveShapeCommand;
