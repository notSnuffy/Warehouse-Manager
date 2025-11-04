import CreateCommandEventHandler from "@managers/CreateCommandEventHandler";
import CompositeCommand from "@commands/CompositeCommand";
import MoveLabelCommand from "@commands/labels/MoveLabelCommand";
import RemoveLabelCommand from "@commands/labels/RemoveLabelCommand";

/**
 * LabeledCreateCommandEventHandler class
 * Extends CreateCommandEventHandler to handle labeled shapes.
 * @extends CreateCommandEventHandler
 */
class LabeledCreateCommandEventHandler extends CreateCommandEventHandler {
  /**
   * The ShapeLabeler instance
   * @type {ShapeLabeler}
   */
  #shapeLabeler;

  /**
   * Constructor
   * @param {Phaser.Scene} scene - The scene instance
   * @param {UndoRedoManager} undoRedoManager - The UndoRedoManager instance
   * @param {ShapeManager} shapeManager - The ShapeManager instance
   * @param {ShapeLabeler} shapeLabeler - The ShapeLabeler instance
   */
  constructor(scene, undoRedoManager, shapeManager, shapeLabeler) {
    super(scene, undoRedoManager, shapeManager);
    this.#shapeLabeler = shapeLabeler;
  }

  /**
   * Handles move command by adding a MoveLabelCommand to the composite command.
   * @param {MoveShapeCommand} command - The original move command
   * @param {Object} shape - The shape being moved
   * @param {Object} oldPosition - The old position of the shape
   * @property {number} oldPosition.x - The old x position
   * @property {number} oldPosition.y - The old y position
   * @param {Object} newPosition - The new position of the shape
   * @property {number} newPosition.x - The new x position
   * @property {number} newPosition.y - The new y position
   * @return {void}
   */
  handleMoveCommand(command, shape, oldPosition, newPosition) {
    const compositeCommand = new CompositeCommand();
    compositeCommand.addCommand(command);

    const labelCommand = new MoveLabelCommand(
      this.#shapeLabeler,
      shape,
      oldPosition,
      newPosition,
    );
    compositeCommand.addCommand(labelCommand);
    this.undoRedoManager.pushCommand(compositeCommand);
  }

  /**
   * Handles resize command by adding a MoveLabelCommand to the composite command.
   * @param {ResizeShapeCommand} command - The original resize command
   * @param {Object} shape - The shape being resized
   * @param {Object} oldDimensions - The old dimensions of the shape
   * @property {number} oldDimensions.x - The old x position
   * @property {number} oldDimensions.y - The old y position
   * @property {number} oldDimensions.width - The old width
   * @property {number} oldDimensions.height - The old height
   * @param {Object} newDimensions - The new dimensions of the shape
   * @property {number} newDimensions.x - The new x position
   * @property {number} newDimensions.y - The new y position
   * @property {number} newDimensions.width - The new width
   * @property {number} newDimensions.height - The new height
   * @return {void}
   */
  handleResizeCommand(command, shape, oldDimensions, newDimensions) {
    const compositeCommand = new CompositeCommand();
    compositeCommand.addCommand(command);

    const labelCommand = new MoveLabelCommand(
      this.#shapeLabeler,
      shape,
      { x: oldDimensions.x, y: oldDimensions.y },
      { x: newDimensions.x, y: newDimensions.y },
    );
    compositeCommand.addCommand(labelCommand);
    this.undoRedoManager.pushCommand(compositeCommand);
  }

  /**
   * Handles shape removal by adding a RemoveLabelCommand to the composite command.
   * @param {RemoveShapeCommand} command - The original remove command
   * @param {Phaser.GameObjects.Shape} shape - The shape being removed
   * @return {void}
   */
  handleShapeRemoved(command, shape) {
    const compositeCommand = new CompositeCommand();
    const labelCommand = new RemoveLabelCommand(this.#shapeLabeler, shape);
    labelCommand.execute();
    compositeCommand.addCommand(labelCommand);
    compositeCommand.addCommand(command);

    this.undoRedoManager.pushCommand(compositeCommand);
  }
}

export default LabeledCreateCommandEventHandler;
