import ShapeModalUserInterface from "@ui/ShapeModalUserInterface";
import { DefaultShapeInteractiveConfig } from "@utils/shapes";
import CompositeCommand from "@commands/CompositeCommand";
import AddLabelCommand from "@commands/labels/AddLabelCommand";

/**
 * LabeledShapeModalUserInterface class
 * Extends ShapeModalUserInterface to handle labeled shapes.
 * @extends ShapeModalUserInterface
 */
class LabeledShapeModalUserInterface extends ShapeModalUserInterface {
  /**
   * The ShapeLabeler instance
   * @type {ShapeLabeler}
   */
  #labeler;

  /**
   * Callback function to call after label updates
   * @type {Function}
   */
  #labelUpdateCallback;

  /**
   * Creates an instance of LabeledShapeModalUserInterface.
   * @param {ShapeManager} shapeManager - The shape manager instance
   * @param {ShapeLabeler} shapeLabeler - The shape labeler instance
   * @param {UndoRedoManager} undoRedoManager - The UndoRedoManager instance
   * @param {string} modalId - The ID of the modal element
   * @param {Array} managersToRegisterWith - The list of managers to register new shapes with
   * @param {Object} shapeFieldsSchemas - The shape fields schemas
   * @param {Function} labelUpdateCallback - Callback function to call after label updates
   */
  constructor(
    shapeManager,
    shapeLabeler,
    undoRedoManager,
    modalId,
    managersToRegisterWith,
    shapeFieldsSchemas,
    labelUpdateCallback = () => {},
  ) {
    super(
      shapeManager,
      undoRedoManager,
      modalId,
      managersToRegisterWith,
      shapeFieldsSchemas,
    );
    this.#labeler = shapeLabeler;
    this.#labelUpdateCallback = labelUpdateCallback;
  }

  /**
   * Handles adding a new shape with a label.
   * @param {string} shapeType - The type of shape to add.
   * @param {Object} params - The parameters for creating the shape, including zoneName and labelColor.
   * @returns {Promise<void>}
   * @override
   */
  async handleAddShape(shapeType, params) {
    const { shape, command } = await this.shapeManager.addShapeWithCommand(
      shapeType,
      params,
      {
        interactive: DefaultShapeInteractiveConfig[shapeType.toUpperCase()],
        managers: this.managersToRegisterWith,
      },
      true,
    );

    const compositeCommand = new CompositeCommand();
    compositeCommand.addCommand(command);
    const addLabelCommand = new AddLabelCommand(
      this.#labeler,
      shape,
      params.zoneName,
      params.labelColor,
      this.#labelUpdateCallback,
    );
    compositeCommand.addCommand(addLabelCommand);
    addLabelCommand.execute();
    this.undoRedoManager.pushCommand(compositeCommand);
  }
}

export default LabeledShapeModalUserInterface;
