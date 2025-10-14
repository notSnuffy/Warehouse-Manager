import BaseCommand from "@commands/BaseCommand.js";

/**
 * AddShapeCommand class
 * This command adds a shape to the scene.
 */
class AddShapeCommand extends BaseCommand {
  /**
   * The shape manager to manage shapes in the scene.
   * @type {ShapeManager}
   * @private
   */
  #shapeManager;

  /**
   * The type of shape to add.
   * @type {string}
   * @private
   */
  #type;

  /**
   * The parameters for creating the shape.
   * @type {Object}
   * @private
   */
  #params;

  /**
   * Additional data for the shape (e.g., id, interactive).
   * @type {Object}
   * @private
   */
  #additionalData;

  /**
   * The ID of the added shape.
   * @type {string|null}
   * @private
   */
  #shapeId;

  /**
   * Creates an instance of AddShapeCommand.
   * @param {Object} shapeManager - The shape manager to manage shapes in the scene.
   * @param {string} type - The type of shape to add.
   * @param {Object} params - The parameters for creating the shape.
   * @param {Object} [additionalData={}] - Additional data for the shape (e.g., id, interactive).
   */
  constructor(shapeManager, type, params, additionalData = {}) {
    super();
    this.#shapeManager = shapeManager;
    this.#type = type;
    this.#params = params;
    this.#additionalData = additionalData;
  }

  /**
   * Executes the command to add the shape to the scene.
   * @returns {Promise<void>}
   */
  async execute() {
    const shape = await this.#shapeManager.addShape(
      this.#type,
      this.#params,
      this.#additionalData,
    );
    this.#shapeId = shape.internalId;
    return shape;
  }

  /**
   * Undoes the command by removing the shape from the scene.
   * @returns {Promise<void>}
   */
  async undo() {
    if (!this.#shapeId) {
      console.warn("No shape to remove.");
      return;
    }

    this.#shapeManager.removeShapeById(this.#shapeId);
    this.#shapeId = null;
  }
}

export default AddShapeCommand;
