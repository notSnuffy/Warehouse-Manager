import ShapeFactory from "@factories/ShapeFactory";
import AddShapeCommand from "@commands/AddShapeCommand";
import RemoveShapeCommand from "@commands/RemoveShapeCommand";
import Phaser from "phaser";

/** Class for managing shapes in an editor. */
class ShapeManager {
  /**
   * The scene to which this manager belongs.
   * @type {Phaser.Scene}
   * @private
   */
  #scene;

  /**
   * The undo/redo manager for managing history.
   * @type {UndoRedoManager}
   */
  #undoRedoManager;

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
   * @param {Object} undoRedoManager - The undo/redo manager for managing history.
   * @param {Object} managers - Object where key represents manager ID and value represents the manager instance. Managers to register new shapes with.
   */
  constructor(scene, undoRedoManager, managers) {
    this.#scene = scene;
    this.#undoRedoManager = undoRedoManager;
    this.#factory = new ShapeFactory(this.#scene, this.#registry, managers);

    this.#scene.events.on("shapeDeleteRequested", (shape) => {
      this.removeShapeByIdHistoryManaged(shape.internalId);
    });

    this.#scene.events.on("undoPerformed", () => {
      console.log("Undo performed");
      console.log(this.#shapes);
    });
    this.#scene.events.on("redoPerformed", () => {
      console.log("Redo performed");
      console.log(this.#shapes);
    });
  }

  /**
   * Registers a new shape type with its factory function and metadata.
   * @param {string} type - The unique identifier for the shape type.
   * @param {Function} factory - The factory function to create instances of the shape.
   * @param {Object} [metadata={}] - Additional metadata for the shape type.
   * @param {Phaser.Types.Input.InputConfiguration} [metadata.defaultInteractive] - Default interactive configuration for the shape type.
   * @param {string} [metadata.command] - The command associated with the shape type.
   * @param {number} [metadata.priority] - The priority of the shape type for command resolution.
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
   * Gets metadata for all registered shape types.
   * @returns {Object} An object containing metadata for all registered shape types.
   */
  getAllShapeMetadata() {
    const allMetadata = {};
    this.#registry.forEach((value, key) => {
      allMetadata[key] = value.metadata;
    });
    return allMetadata;
  }

  /**
   * Adds a shape to the manager using the factory.
   * @param {string} type - The type of shape to add.
   * @param {Object} params - The parameters to pass to the shape factory.
   * @param {Object} [additionalData={}] - Additional data to attach to the shape.
   * @param {string} [additionalData.id] - An optional ID to assign to the shape.
   * @param {Phaser.Types.Input.InputConfiguration} [additionalData.interactive] - Optional interactive configuration for the shape.
   * @param {Object} [additionalData.metadata] - Optional metadata to attach to the shape.
   * @param {String[]} [additionalData.managers] - Optional list of manager IDs the shape belongs to.
   * @throws {Error} If the shape type is not registered.
   * @returns {Promise<Phaser.GameObjects.Shape>} The added shape.
   */
  async addShape(type, params, additionalData = {}) {
    const shape = await this.#factory.create(type, params, additionalData);

    if (!this.#shapes.has(shape.internalId)) {
      shape.internalId = additionalData.id || Phaser.Utils.String.UUID();
    }

    this.#shapes.set(shape.internalId, shape);
    return shape;
  }

  /**
   * Adds a shape to the manager from a snapshot.
   * @param {Object} snapshot - The snapshot of the shape to add.
   * @param {Object} snapshot.transform - The transform properties of the shape.
   * @param {number} snapshot.transform.x - The x position of the shape.
   * @param {number} snapshot.transform.y - The y position of the shape.
   * @param {number} snapshot.transform.width - The width of the shape.
   * @param {number} snapshot.transform.height - The height of the shape.
   * @param {number} snapshot.transform.rotation - The rotation of the shape in radians.
   * @param {Object} snapshot.specific - The specific properties of the shape.
   * @param {Object} snapshot.metadata - The metadata of the shape, including its type.
   * @param {string} snapshot.metadata.type - The type of the shape.
   * @param {Object} [snapshot.additionalData] - Additional data to attach to the shape.
   * @param {string} [snapshot.additionalData.id] - An optional ID to assign to the shape.
   * @param {Phaser.Types.Input.InputConfiguration} [snapshot.additionalData.interactive] - Optional interactive configuration for the shape.
   * @param {String[]} [snapshot.additionalData.managers] - Optional list of manager IDs the shape belongs to.
   * @param {Object[]} [snapshot.children] - Optional child shapes.
   * @throws {Error} If the shape type is not registered.
   * @returns {Promise<Phaser.GameObjects.Shape>} The added shape.
   */
  async addShapeFromSnapshot(snapshot) {
    const { transform, specific, metadata, additionalData, children } =
      snapshot;
    const params = {
      ...transform,
      ...specific,
      children: children || [],
    };
    return this.addShape(metadata.type, params, {
      metadata,
      interactive: additionalData?.interactive,
      id: additionalData?.id,
      managers: additionalData?.managers,
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
   * @param {String[]} [additionalData.managers] - Optional list of manager IDs the shape belongs to.
   * @throws {Error} If the shape type is not registered.
   * @returns {Promise<Phaser.GameObjects.Shape>} The added shape.
   */
  async addShapeHistoryManaged(type, params, additionalData = {}) {
    const command = new AddShapeCommand(this, type, params, additionalData);
    const shape = await command.execute();
    this.#undoRedoManager.pushCommand(command);
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
    this.#undoRedoManager.pushCommand(command);
    return result;
  }

  /**
   * Gets all shapes managed by this manager.
   * @returns {Phaser.GameObjects.Shape[]} An array of all shapes.
   */
  getAllShapes() {
    console.log(this.#shapes);
    return Array.from(this.#shapes.values());
  }

  /**
   * Gets all root shapes (shapes without a parent container).
   * @returns {Phaser.GameObjects.Shape[]} An array of all root shapes.
   */
  getRootShapes() {
    return Array.from(this.#shapes.values()).filter(
      (shape) => !shape.parentContainer,
    );
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
