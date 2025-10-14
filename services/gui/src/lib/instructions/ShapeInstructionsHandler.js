class ShapeInstructionsHandler {
  /**
   * @param {ShapeManager} shapeManager
   * @private
   */
  #shapeManager;

  /**
   * Creates an instance of ShapeInstructionsHandler.
   * @param {ShapeManager} shapeManager
   */
  constructor(shapeManager) {
    this.#shapeManager = shapeManager;
  }

  /**
   * Applies a field map to the given properties.
   * @param {Object} fieldMap - The field map to apply.
   * @param {Object} properties - The properties to map.
   * @returns {Object} The mapped properties.
   * @private
   */
  #applyFieldMap(fieldMap, properties) {
    let mapped = {};
    for (const [key, value] of Object.entries(fieldMap)) {
      if (Object.hasOwn(properties, key)) {
        mapped[value] = properties[key];
        delete properties[key];
      }
    }
    mapped = { ...mapped, ...properties };
    return mapped;
  }

  /**
   * Converts a shape and its children into a list of instructions.
   * * @param {Object} snapshot - The snapshot of the shape to convert.
   * @param {Array} [instructions=[]] - The list of instructions to append to.
   * @return {Array} The list of instructions.
   * @throws {Error} If the shape type is not registered.
   * @public
   */
  convertToInstructions(snapshot, instructions = []) {
    if (!snapshot) {
      return;
    }

    const { metadata, transform, specific, children } = snapshot;
    console.log("convertToInstructions snapshot", snapshot);

    let baseParameters = {
      shapeId: metadata.id,
      shapeVersion: metadata.version,
      positionX: transform.x,
      positionY: transform.y,
      width: transform.width,
      height: transform.height,
      rotation: transform.rotation,
    };

    const type = metadata.type;
    const registryMeta = this.#shapeManager.getShapeMetadata(type);
    const command = registryMeta.command || "CREATE_GENERIC";
    const fieldMap = registryMeta.fieldMap || {};

    const specificParameters = { ...specific };
    const parameters = this.#applyFieldMap(fieldMap, {
      ...baseParameters,
      ...specificParameters,
    });
    instructions.push({ command, parameters });

    if (children && children.length > 0) {
      for (const child of children) {
        this.convertToInstructions(child, instructions);
      }
      instructions.push({ command: "END_CONTAINER" });
    }
    return instructions;
  }
}

export default ShapeInstructionsHandler;
