import ShapeFactory from "@factories/ShapeFactory";
import AddShapeCommand from "@commands/AddShapeCommand";
import RemoveShapeCommand from "@commands/RemoveShapeCommand";

/** Class for managing shapes in an editor. */
class ShapeManager {
  /**
   * The scene to which this manager belongs.
   * @type {Phaser.Scene}
   */
  #scene;

  /**
   * The factory to create shapes.
   * @type {ShapeFactory}
   */
  #factory = null;

  /**
   * A set storing all the references to shapes managed by this manager.
   * @type {Set<Phaser.GameObjects.Shape>}
   */
  #shapes = new Set();

  /**
   * A registry for shapes registered in the manager.
   * Contains a factory function and additional metadata for each shape type.
   * @type {Map<string, { factory: Function, metadata: Object }>}
   */
  #registry = new Map();

  /**
   * Creates an instance of ShapeManager.
   * @param {Phaser.Scene} scene - The scene to which this manager belongs.
   * @param {Object} managers - Object where key represents manager ID and value represents the manager instance. Managers to register new shapes with.
   */
  constructor(scene, managers) {
    this.#scene = scene;
    this.#factory = new ShapeFactory(this.#scene, this.#registry, managers);

    this.#scene.events.on("shapeDeleteRequested", async (shape) => {
      if (!this.hasShape(shape)) {
        return;
      }

      const { result, command } = await this.removeShapeWithCommand(
        shape,
        false,
      );
      if (!result) {
        return;
      }
      command.emitEvent = true;
      this.#scene.events.emit("shapeRemoved", shape, command);
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
   * @param {Phaser.Types.Input.InputConfiguration} [additionalData.interactive] - Optional interactive configuration for the shape.
   * @param {Object} [additionalData.metadata] - Optional metadata to attach to the shape.
   * @param {String[]} [additionalData.managers] - Optional list of manager IDs the shape belongs to.
   * @param {boolean} [emitEvent=true] - Whether to emit an event after adding the shape.
   * @throws {Error} If the shape type is not registered.
   * @returns {Promise<Phaser.GameObjects.Shape|null>} The added shape.
   */
  async addShape(type, params, additionalData = {}, emitEvent = true) {
    const shape = await this.#factory.create(type, params, additionalData);
    if (!shape) {
      return null;
    }

    shape.deleted = false;
    shape.manager = this;

    this.#shapes.add(shape);
    if (emitEvent) {
      this.#scene.events.emit("shapeAdded", shape);
    }
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
   * @param {Phaser.Types.Input.InputConfiguration} [snapshot.additionalData.interactive] - Optional interactive configuration for the shape.
   * @param {String[]} [snapshot.additionalData.managers] - Optional list of manager IDs the shape belongs to.
   * @param {Object[]} [snapshot.children] - Optional child shapes.
   * @param {boolean} [emitEvent=true] - Whether to emit an event after adding the shape.
   * @throws {Error} If the shape type is not registered.
   * @returns {Promise<Phaser.GameObjects.Shape|null>} The added shape.
   */
  async addShapeFromSnapshot(snapshot, emitEvent = true) {
    const { transform, specific, metadata, additionalData, children } =
      snapshot;
    const params = {
      ...transform,
      ...specific,
      children: children || [],
    };
    return this.addShape(
      metadata.type,
      params,
      {
        metadata,
        interactive: additionalData?.interactive,
        managers: additionalData?.managers,
      },
      emitEvent,
    );
  }

  /**
   * Adds a shape to the manager using a command for undo/redo support.
   * @param {string} type - The type of shape to add.
   * @param {Object} params - The parameters to pass to the shape factory.
   * @param {Object} [additionalData={}] - Additional data to attach to the shape.
   * @param {Phaser.Types.Input.InputConfiguration} [additionalData.interactive] - Optional interactive configuration for the shape.
   * @param {Object} [additionalData.metadata] - Optional metadata to attach to the shape.
   * @param {String[]} [additionalData.managers] - Optional list of manager IDs the shape belongs to.
   * @param {boolean} [emitEvent=true] - Whether to emit an event after adding the shape.
   * @throws {Error} If the shape type is not registered.
   * @returns {Promise<{shape: Phaser.GameObjects.Shape, command: AddShapeCommand}|null>} The added shape and the command used to add it.
   */
  async addShapeWithCommand(
    type,
    params,
    additionalData = {},
    emitEvent = true,
  ) {
    const command = new AddShapeCommand(
      this,
      type,
      params,
      additionalData,
      emitEvent,
    );
    const shape = await command.execute();
    if (!shape) {
      return null;
    }

    return { shape, command };
  }

  /**
   * Restores a shape that was previously marked as deleted.
   * @param {Phaser.GameObjects.Shape} shape - The shape to restore.
   * @returns {void}
   */
  #restoreShape(shape) {
    shape.deleted = false;
    shape.setVisible(true);
    shape.setActive(true);
    if (shape.input) {
      shape.input.enabled = true;
    }

    if (shape.list && shape.list.length > 0) {
      shape.list.forEach((child) => this.#restoreShape(child));
    }
  }

  /**
   * Adds an existing shape to the manager.
   * If the shape is already managed and marked as deleted, it restores the shape.
   * @param {Phaser.GameObjects.Shape} shape - The shape to add.
   * @param {boolean} [emitEvent=true] - Whether to emit an event after adding the shape.
   * @returns {Phaser.GameObjects.Shape} The added or restored shape.
   */
  addExistingShape(shape, emitEvent = true) {
    if (this.hasShape(shape)) {
      if (shape.deleted) {
        this.#restoreShape(shape);
        if (emitEvent) {
          this.#scene.events.emit("shapeAdded", shape);
        }
      }
      return shape;
    }

    if (shape.manager) {
      throw new Error(
        "Shape is already managed by another ShapeManager. Cannot add existing shape.",
      );
    }

    this.#shapes.add(shape);
    shape.deleted = false;
    shape.manager = this;

    if (emitEvent) {
      this.#scene.events.emit("shapeAdded", shape);
    }
    return shape;
  }

  /**
   * Checks if a shape is managed by this manager.
   * @param {Phaser.GameObjects.Shape} shape - The shape to check.
   * @returns {boolean} True if the shape is managed by this manager, otherwise false.
   */
  hasShape(shape) {
    return this.#shapes.has(shape);
  }

  /**
   * Marks a shape as deleted (soft delete).
   * @param {Phaser.GameObjects.Shape} shape - The shape to mark as deleted.
   * @returns {void}
   */
  #setDeleted(shape) {
    shape.deleted = true;
    shape.setVisible(false);
    shape.setActive(false);
    if (shape.input && shape.input.enabled) {
      shape.input.enabled = false;
    }
  }

  /**
   * Removes a shape from the manager (soft delete).
   * @param {Phaser.GameObjects.Shape} shape - The shape to remove.
   * @param {boolean} [emitEvent=true] - Whether to emit an event after removing the shape.
   * @returns {boolean} True if the shape was removed, otherwise false.
   */
  removeShape(shape, emitEvent = true) {
    if (!this.hasShape(shape) || shape.deleted) {
      return false;
    }

    if (shape.list && shape.list.length > 0) {
      shape.list.forEach((child) => this.removeShape(child, false));
    }

    this.#setDeleted(shape);

    if (emitEvent) {
      this.#scene.events.emit("shapeRemoved", shape);
    }
    return true;
  }

  /**
   * Removes a shape from the manager using a command for undo/redo support.
   * @param {Phaser.GameObjects.Shape} shape - The shape to remove.
   * @param {boolean} [emitEvent=true] - Whether to emit an event after removing the shape.
   * @returns {Promise<{result: boolean, command: RemoveShapeCommand}>} The result of the removal and the command used to remove it.
   */
  async removeShapeWithCommand(shape, emitEvent = true) {
    const command = new RemoveShapeCommand(this, shape, emitEvent);
    const result = await command.execute();
    return { result, command };
  }

  /**
   * Gets all shapes managed by this manager.
   * @returns {Phaser.GameObjects.Shape[]} An array of all shapes.
   */
  getAllShapes() {
    console.log(this.#shapes);
    return Array.from(this.#shapes).filter((shape) => !shape.deleted);
  }

  /**
   * Gets all root shapes (shapes without a parent container).
   * @returns {Phaser.GameObjects.Shape[]} An array of all root shapes.
   */
  getRootShapes() {
    return Array.from(this.#shapes).filter(
      (shape) => !shape.parentContainer && !shape.deleted,
    );
  }

  /**
   * Removes all shapes from the manager (soft delete).
   * @returns {void}
   */
  removeAllShapes() {
    this.#shapes.forEach((shape) => {
      this.removeShape(shape, false);
    });
  }

  /**
   * Clears all shapes from the manager and destroys them.
   * @returns {void}
   */
  clearAllShapes() {
    this.#shapes.forEach((shape) => {
      shape.destroy();
    });
    this.#shapes.clear();
  }
}

export default ShapeManager;
