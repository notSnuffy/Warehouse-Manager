class ShapeFactory {
  /**
   * Scene to which to add shapes
   * @private
   * @type {Phaser.Scene}
   */
  #scene;

  /**
   * A registry for shapes registered in the manager this factory belongs to.
   * Contains a factory function and additional metadata for each shape type.
   * @type {Map<string, { factory: Function, metadata: Object }>}
   * @private
   */
  #registry;

  /**
   * Creates an instance of ShapeFactory.
   * @param {Phaser.Scene} scene - The scene to which this factory belongs.
   * @param {Map<string, { factory: Function, metadata: Object }>} registry - The shape registry from the manager this factory belongs to.
   */
  constructor(scene, registry) {
    this.#scene = scene;
    this.#registry = registry;
  }

  /**
   * Creates a shape of the specified type using the registered factory function.
   * @param {string} type - The type of shape to create.
   * @param {Object} params - The parameters to pass to the factory function.
   * @param {Object} [additionalData={}] - Additional data to attach to the created shape.
   * @param {Phaser.Types.Input.InputConfiguration} [additionalData.interactive] - Optional interactive configuration for the shape.
   * @param {Object} [additionalData.metadata] - Optional metadata to attach to the shape.
   *
   * @throws {Error} If the shape type is not registered or if the factory does not return a valid Phaser Game Object.
   * @returns {Promise<Phaser.GameObjects.Shape>} The created shape.
   */
  async create(type, params, additionalData = {}) {
    const shapeEntry = this.#registry.get(type);
    if (!shapeEntry) {
      throw new Error(`Shape type '${type}' is not registered.`);
    }

    const { factory, metadata } = shapeEntry;

    const shape = await factory(this.#scene, params);
    if (!shape) {
      throw new Error(
        `Factory for shape type '${type}' did not return a valid Phaser Game Object.`,
      );
    }

    if (metadata.defaultInteractive && !additionalData.interactive) {
      const interactiveConfig = {
        ...metadata.defaultInteractive,
        hitArea: metadata.defaultInteractive.hitArea
          ? metadata.defaultInteractive.hitArea(shape)
          : null,
      };
      shape.setInteractive(interactiveConfig);
    }

    if (additionalData.interactive) {
      const interactiveConfig = {
        ...additionalData.interactive,
        hitArea: additionalData.interactive.hitArea
          ? additionalData.interactive.hitArea(shape)
          : null,
      };
      shape.setInteractive(interactiveConfig);
    }

    shape.interactiveData = additionalData.interactive || null;

    shape.metadata = {
      ...shape.metadata,
      ...(additionalData.metadata || {}),
      type,
    };

    return shape;
  }
}

export default ShapeFactory;
