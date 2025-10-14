import ShapeFactory from "@factories/ShapeFactory";
import AddShapeCommand from "@commands/AddShapeCommand";
import RemoveShapeCommand from "@commands/RemoveShapeCommand";

/** Class for managing shapes in an editor. */
class ShapeManager {
  /**
   * The scene to which this manager belongs.
   * @type {Phaser.Scene}
   * @private
   */
  #scene;

  /**
   * The factory to create shapes.
   * @type {ShapeFactory}
   * @private
   */
  #factory = null;

  /**
   * A map to store shapes by their IDs.
   * @type {Map<string, Phaser.GameObjects.Shape>}
   * @private
   */
  #shapes = new Map();

  /**
   * A registry for shapes registered in the manager.
   * Contains a factory function and additional metadata for each shape type.
   * @type {Map<string, { factory: Function, metadata: Object }>}
   * @private
   */
  #registry = new Map();

  /**
   * Creates an instance of ShapeManager.
   * @param {Phaser.Scene} scene - The scene to which this manager belongs.
   */
  constructor(scene) {
    this.#scene = scene;
    this.#factory = new ShapeFactory(this.#scene, this.#registry);
  }

  /**
   * Registers a new shape type with its factory function and metadata.
   * @param {string} type - The unique identifier for the shape type.
   * @param {Function} factory - The factory function to create instances of the shape.
   * @param {Object} [metadata={}] - Additional metadata for the shape type.
   * @param {Phaser.Types.Input.InputConfiguration} [metadata.defaultInteractive] - Default interactive configuration for the shape type.
   * @param {string} [metadata.command] - The command associated with the shape type.
   * @param {Object} [metadata.fieldMap] - A mapping of fields for the shape type.
   * @throws {Error} If the shape type is already registered.
   * @returns {void}
   */
  registerShape(type, factory, metadata = {}) {
    if (this.#registry.has(type)) {
      throw new Error(`Shape type '${type}' is already registered.`);
    }
    this.#registry.set(type, { factory, metadata });
  }

  /**
   * Gets the metadata for a registered shape type.
   * @param {string} type - The type of shape.
   * @throws {Error} If the shape type is not registered.
   * @returns {Object} The metadata for the shape type.
   */
  getShapeMetadata(type) {
    const shapeEntry = this.#registry.get(type);
    if (!shapeEntry) {
      throw new Error(`Shape type '${type}' is not registered.`);
    }
    return shapeEntry.metadata;
  }

  /**
   * Adds a shape to the manager using the factory.
   * @param {string} type - The type of shape to add.
   * @param {Object} params - The parameters to pass to the shape factory.
   * @param {Object} [additionalData={}] - Additional data to attach to the shape.
   * @param {string} [additionalData.id] - An optional ID to assign to the shape.
   * @param {Phaser.Types.Input.InputConfiguration} [additionalData.interactive] - Optional interactive configuration for the shape.
   * @param {Object} [additionalData.metadata] - Optional metadata to attach to the shape.
   * @throws {Error} If the shape type is not registered.
   * @returns {Promise<Phaser.GameObjects.Shape>} The added shape.
   */
  async addShape(type, params, additionalData = {}) {
    const shape = await this.#factory.create(type, params, additionalData);
    this.#shapes.set(shape.internalId, shape);
    return shape;
  }

  /**
   * Adds a shape to the manager from a snapshot.
   * @param {Object} snapshot - The snapshot of the shape to add.
   * @param {string} snapshot.type - The type of shape.
   * @param {Object} snapshot.params - The parameters for creating the shape.
   * @param {Object} snapshot.metadata - The metadata to attach to the shape.
   * @param {Object} snapshot.additionalData - Additional data for the shape (e.g., id, interactive).
   * @throws {Error} If the shape type is not registered.
   * @returns {Promise<Phaser.GameObjects.Shape>} The added shape.
   */
  async addShapeFromSnapshot(snapshot) {
    const { type, params, metadata, additionalData } = snapshot;
    return this.addShape(type, params, {
      metadata,
      interactive: additionalData.interactive,
    });
  }

  /**
   * Adds a shape to the manager using the factory and records the action in history.
   * @param {string} type - The type of shape to add.
   * @param {Object} params - The parameters to pass to the shape factory.
   * @param {Object} [additionalData={}] - Additional data to attach to the shape.
   * @param {string} [additionalData.id] - An optional ID to assign to the shape.
   * @param {Phaser.Types.Input.InputConfiguration} [additionalData.interactive] - Optional interactive configuration for the shape.
   * @param {Object} [additionalData.metadata] - Optional metadata to attach to the shape.
   * @throws {Error} If the shape type is not registered.
   * @returns {Promise<Phaser.GameObjects.Shape>} The added shape.
   */
  async addShapeHistoryManaged(type, params, additionalData = {}) {
    const command = new AddShapeCommand(this, type, params, additionalData);
    const shape = await command.execute();
    console.log(shape);
    return shape;
  }

  /**
   * Retrieves a shape by its ID.
   * @param {string} id - The ID of the shape to retrieve.
   * @returns {Phaser.GameObjects.Shape|null} The shape if found, otherwise null.
   */
  getShapeById(id) {
    return this.#shapes.get(id) || null;
  }

  /**
   * Removes a shape by its ID.
   * @param {string} id - The ID of the shape to remove.
   * @returns {boolean} True if the shape was removed, otherwise false.
   */
  removeShapeById(id) {
    const shape = this.#shapes.get(id);
    if (!shape) {
      return false;
    }

    shape.destroy();
    this.#shapes.delete(id);
    return true;
  }

  /**
   * Removes a shape by its ID and records the action in history.
   * @param {string} id - The ID of the shape to remove.
   * @returns {Promise<boolean>} True if the shape was removed, otherwise false.
   */
  async removeShapeByIdHistoryManaged(id) {
    const command = new RemoveShapeCommand(this, id);
    const result = await command.execute();
    return result;
  }

  /**
   * Gets all shapes managed by this manager.
   * @returns {Phaser.GameObjects.Shape[]} An array of all shapes.
   */
  getAllShapes() {
    return Array.from(this.#shapes.values());
  }

  /**
   * Clears all shapes from the manager and destroys them.
   * @returns {void}
   */
  clearAllShapes() {
    this.#shapes.forEach((shape) => shape.destroy());
    this.#shapes.clear();
  }
}

export default ShapeManager;
