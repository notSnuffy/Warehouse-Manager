import InstructionCommands from "@instructions/InstructionCommands.js";

class ShapeInstructionsHandler {
  /**
   * @param {ShapeManager} shapeManager
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
    const command = registryMeta.command || InstructionCommands.CREATE_GENERIC;
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
      instructions.push({ command: InstructionCommands.END_CONTAINER });
    }
    return instructions;
  }

  /**
   * Reverses a field map on the given parameters.
   * @param {Object} fieldMap - The field map to reverse.
   * @param {Object} parameters - The parameters to reverse map.
   * @return {Object} The reverse mapped parameters.
   * @private
   */
  #reverseApplyFieldMap(fieldMap, parameters) {
    let reversed = {};
    for (const [key, value] of Object.entries(fieldMap)) {
      if (Object.hasOwn(parameters, value)) {
        reversed[key] = parameters[value];
        delete parameters[value];
      }
    }
    reversed = { ...reversed, ...parameters };
    return reversed;
  }

  /**
   * Gets a mapping of commands to shape types based on registered shapes.
   * @param {Object} allMetadata - Metadata for all registered shape types.
   * @returns {Object} A mapping of commands to shape types.
   * @private
   */
  #getTypesForCommands(allMetadata) {
    const typesForCommands = {};
    for (const [type, meta] of Object.entries(allMetadata)) {
      if (!meta.command) {
        continue;
      }

      const priority = meta.priority || 0;

      const existing = typesForCommands[meta.command];

      if (existing && existing.priority >= priority) {
        continue;
      }

      typesForCommands[meta.command] = { type, priority };
    }
    return typesForCommands;
  }

  /**
   * Converts a list of instructions into shapes.
   * @param {Array} instructions - The list of instructions to convert.
   * @param {number} color - The color to apply to the shapes.
   * @return {Promise<Object>} The list of created snapshots.
   * @throws {Error} If a shape type is not registered for a command.
   * @public
   */
  async convertFromInstructions(instructions, color) {
    const allMetadata = this.#shapeManager.getAllShapeMetadata();
    const typesForCommands = this.#getTypesForCommands(allMetadata);

    const containerStack = [];
    const shapesSnapshots = [];

    for (const instruction of instructions) {
      const { command, parameters } = instruction;

      const type = typesForCommands[command]?.type || null;

      const fieldMap = allMetadata[type]?.fieldMap || {};

      const mappedParameters = this.#reverseApplyFieldMap(fieldMap, {
        ...parameters,
      });

      const transform = {
        x: mappedParameters.positionX,
        y: mappedParameters.positionY,
        width: mappedParameters.width,
        height: mappedParameters.height,
        rotation: mappedParameters.rotation,
      };

      delete mappedParameters.positionX;
      delete mappedParameters.positionY;
      delete mappedParameters.width;
      delete mappedParameters.height;
      delete mappedParameters.rotation;

      const metadata = {
        id: mappedParameters.shapeId,
        version: mappedParameters.shapeVersion,
        type: type,
      };

      delete mappedParameters.shapeId;
      delete mappedParameters.shapeVersion;

      const specific = { ...mappedParameters };

      specific.color = color || 0x123456;

      const snapshot = {
        transform,
        specific,
        metadata,
      };

      switch (command) {
        case InstructionCommands.BEGIN_CONTAINER:
          snapshot.children = [];

          if (containerStack.length > 0) {
            const parent = containerStack[containerStack.length - 1];
            parent.children.push(snapshot);
          } else {
            shapesSnapshots.push(snapshot);
          }
          containerStack.push(snapshot);
          break;
        case InstructionCommands.END_CONTAINER:
          if (containerStack.length > 0) {
            containerStack.pop();
          } else {
            console.warn(
              "END_CONTAINER instruction without matching BEGIN_CONTAINER",
            );
          }
          break;
        default:
          if (!typesForCommands[command]) {
            console.warn(`No shape type registered for command: ${command}`);
            continue;
          }
          if (containerStack.length > 0) {
            const parent = containerStack[containerStack.length - 1];
            parent.children.push(snapshot);
          } else {
            shapesSnapshots.push(snapshot);
          }
          break;
      }
    }
    return shapesSnapshots;
  }
}

export default ShapeInstructionsHandler;
