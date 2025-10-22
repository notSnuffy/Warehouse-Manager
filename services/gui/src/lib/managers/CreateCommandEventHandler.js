import MoveShapeCommand from "@commands/MoveShapeCommand";

/**
 * CreateCommandEventHandler class
 * This class is responsible for catching events which should be handled by handled by UndoRedoManager
 * and creates corresponding commands to be pushed to the UndoRedoManager.
 */
class CreateCommandEventHandler {
  /**
   * The scene instance.
   * @type {Phaser.Scene}
   */
  #scene;

  /**
   * The UndoRedoManager instance.
   * @type {UndoRedoManager}
   */
  #undoRedoManager;

  /**
   * The ShapeManager instance.
   * @type {ShapeManager}
   */
  #shapeManager;

  /**
   * Data about the shape's position at the start of a move action.
   * @type {Object|null}
   * @property {number} x - The x position at the start of the move.
   * @property {number} y - The y position at the start of the move.
   * @property {string} shapeId - The internal ID of the shape being moved.
   * @default null
   */
  #moveStartData = null;

  /**
   * Constructor
   * @param {Phaser.Scene} scene - The scene instance
   * @param {UndoRedoManager} undoRedoManager - The UndoRedoManager instance
   * @param {ShapeManager} shapeManager - The ShapeManager instance
   */
  constructor(scene, undoRedoManager, shapeManager) {
    this.#scene = scene;
    this.#undoRedoManager = undoRedoManager;
    this.#shapeManager = shapeManager;

    this.#registerEvents();
  }

  /**
   * Registers event listeners for some events and creates corresponding commands.
   * @returns {void}
   */
  #registerEvents() {
    this.#scene.events.on("shapeMoveStart", (shape) => {
      this.#moveStartData = {
        x: shape.x,
        y: shape.y,
        shapeId: shape.internalId,
      };
    });
    this.#scene.events.on("shapeMoveEnd", (shape) => {
      if (
        !this.#moveStartData ||
        this.#moveStartData.shapeId !== shape.internalId
      ) {
        return;
      }

      const moveEndPosition = { x: shape.x, y: shape.y };

      if (
        this.#moveStartData.x === moveEndPosition.x &&
        this.#moveStartData.y === moveEndPosition.y
      ) {
        this.#moveStartData = null;
        return;
      }

      const moveCommand = new MoveShapeCommand(
        this.#shapeManager,
        shape.internalId,
        { x: this.#moveStartData.x, y: this.#moveStartData.y },
        moveEndPosition,
      );
      this.#undoRedoManager.pushCommand(moveCommand);

      this.#moveStartData = null;
    });
  }
}

export default CreateCommandEventHandler;
