import CreateCommandEventHandler from "@managers/CreateCommandEventHandler";
import CompositeCommand from "@commands/CompositeCommand";
import WallMoveCommand from "@commands/floor/WallMoveCommand";

/**
 * CornerCreateCommandEventHandler class
 * Extends CreateCommandEventHandler to handle labeled shapes.
 * @extends CreateCommandEventHandler
 */
class CornerCreateCommandEventHandler extends CreateCommandEventHandler {
  /**
   * Graph representing the floor layout
   * @type {Map<Phaser.GameObjects.Arc, Map<Phaser.GameObjects.Arc, Phaser.GameObjects.Line>>}
   */
  #graph;

  /**
   * Constructor
   * @param {Phaser.Scene} scene - The scene instance
   * @param {UndoRedoManager} undoRedoManager - The UndoRedoManager instance
   * @param {ShapeManager} shapeManager - The ShapeManager instance
   * @param {Map<Phaser.GameObjects.Arc, Map<Phaser.GameObjects.Arc, Phaser.GameObjects.Line>>} graph - The graph representing the floor layout
   */
  constructor(scene, undoRedoManager, shapeManager, graph) {
    super(scene, undoRedoManager, shapeManager);
    this.#graph = graph;
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
   * @override
   */
  handleMoveCommand(command, shape, oldPosition, newPosition) {
    const compositeCommand = new CompositeCommand();
    compositeCommand.addCommand(command);

    const neighbours = this.#graph.get(shape) || new Map();
    neighbours.forEach((wall, neighbour) => {
      const wallOldPosition = {
        from: { x: oldPosition.x, y: oldPosition.y },
        to: { x: neighbour.x, y: neighbour.y },
      };
      const wallNewPosition = {
        from: { x: newPosition.x, y: newPosition.y },
        to: { x: neighbour.x, y: neighbour.y },
      };
      const wallCommand = new WallMoveCommand(
        wall,
        wallOldPosition,
        wallNewPosition,
      );
      compositeCommand.addCommand(wallCommand);
    });

    this.undoRedoManager.pushCommand(compositeCommand);
  }

  /**
   * Ignored resize commands for corners.
   * @param {ResizeShapeCommand} _command - The original resize command
   * @param {Object} _shape - The shape being resized
   * @param {Object} _oldDimensions - The old dimensions of the shape
   * @property {number} _oldDimensions.x - The old x position
   * @property {number} _oldDimensions.y - The old y position
   * @property {number} _oldDimensions.width - The old width
   * @property {number} _oldDimensions.height - The old height
   * @param {Object} _newDimensions - The new dimensions of the shape
   * @property {number} _newDimensions.x - The new x position
   * @property {number} _newDimensions.y - The new y position
   * @property {number} _newDimensions.width - The new width
   * @property {number} _newDimensions.height - The new height
   * @return {void}
   * @override
   */
  handleResizeCommand(_command, _shape, _oldDimensions, _newDimensions) {}

  /**
   * Ignored rotate commands for corners.
   * @param {RotateShapeCommand} _command - The original rotate command
   * @param {Phaser.GameObjects.Shape} _shape - The shape being rotated
   * @param {number} _oldRotation - The old rotation of the shape
   * @param {number} _newRotation - The new rotation of the shape
   * @return {void}
   * @override
   */
  handleRotateCommand(_command, _shape, _oldRotation, _newRotation) {}

  /**
   * Ignored remove commands for corners. -> currently handled in FloorEditor itself
   * @param {RemoveShapeCommand} _command - The original remove command
   * @param {Phaser.GameObjects.Shape} _shape - The shape being removed
   * @return {void}
   * @override
   */
  handleShapeRemoved(_command, _shape) {}
}

export default CornerCreateCommandEventHandler;
