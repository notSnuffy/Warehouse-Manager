import BaseCommand from "@commands/BaseCommand.js";

/**
 * AddShapeCommand class
 * This command adds a shape to the scene.
 */
class AddShapeCommand extends BaseCommand {
  /**
   * The shape manager to manage shapes in the scene.
   * @type {ShapeManager}
   */
  #shapeManager;

  /**
   * The type of shape to add.
   * @type {string}
   */
  #type;

  /**
   * The parameters for creating the shape.
   * @type {Object}
   */
  #params;

  /**
   * Additional data for the shape (e.g., id, interactive).
   * @type {Object}
   */
  #additionalData;

  /**
   * The created shape
   * @type {Phaser.GameObjects.Shape}
   */
  #shape;

  /**
   * Whether to emit events for this command.
   * @type {boolean}
   */
  #emitEvent;

  /**
   * Creates an instance of AddShapeCommand.
   * @param {Object} shapeManager - The shape manager to manage shapes in the scene.
   * @param {string} type - The type of shape to add.
   * @param {Object} params - The parameters for creating the shape.
   * @param {Object} [additionalData={}] - Additional data for the shape (e.g., id, interactive).
   * @param {boolean} [emitEvent=true] - Whether to emit events for this command.
   */
  constructor(
    shapeManager,
    type,
    params,
    additionalData = {},
    emitEvent = true,
  ) {
    super();
    this.#shapeManager = shapeManager;
    this.#type = type;
    this.#params = params;
    this.#additionalData = additionalData;
    this.#emitEvent = emitEvent;
  }

  /**
   * Executes the command to add the shape to the scene.
   * @returns {Promise<Phaser.GameObjects.Shape>}
   */
  async execute() {
    if (this.#shape) {
      this.#shapeManager.addExistingShape(this.#shape, this.#emitEvent);
      return;
    }

    const shape = await this.#shapeManager.addShape(
      this.#type,
      this.#params,
      this.#additionalData,
      this.#emitEvent,
    );
    this.#shape = shape;

    return shape;
  }

  /**
   * Undoes the command by removing the shape from the scene.
   * @returns {Promise<void>}
   */
  async undo() {
    if (!this.#shape) {
      console.warn("No shape to remove.");
      return;
    }

    this.#shapeManager.removeShape(this.#shape, this.#emitEvent);
  }
}

export default AddShapeCommand;
