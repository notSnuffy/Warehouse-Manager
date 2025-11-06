import MoveShapeCommand from "@commands/MoveShapeCommand";
import RotateShapeCommand from "@commands/RotateShapeCommand";
import ResizeShapeCommand from "@commands/ResizeShapeCommand";

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
  undoRedoManager;

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
   * @property {Phaser.GameObjects.Shape} shape - The shape being moved.
   * @default null
   */
  #moveStartData = null;

  /**
   * Data about the shape's rotation at the start of a rotate action.
   * @type {Object|null}
   * @property {number} rotation - The rotation at the start of the rotate.
   * @property {Phaser.GameObjects.Shape} shape - The shape being rotated.
   * @default null
   */
  #rotateStartData = null;

  /**
   * Data about the shape's transform at the start of a resize action.
   * @type {Object|null}
   * @property {number} x - The x position at the start of the resize.
   * @property {number} y - The y position at the start of the resize.
   * @property {number} width - The width at the start of the resize.
   * @property {number} height - The height at the start of the resize.
   * @property {Phaser.GameObjects.Shape} shape - The shape being resized.
   * @default null
   */
  #resizeStartData = null;

  /**
   * Constructor
   * @param {Phaser.Scene} scene - The scene instance
   * @param {UndoRedoManager} undoRedoManager - The UndoRedoManager instance
   * @param {ShapeManager} shapeManager - The ShapeManager instance
   */
  constructor(scene, undoRedoManager, shapeManager) {
    this.#scene = scene;
    this.undoRedoManager = undoRedoManager;
    this.#shapeManager = shapeManager;

    this.#registerMoveEvents();
    this.#registerRotateEvents();
    this.#registerResizeEvents();
    this.#catchShapeRemoved();
  }

  /**
   * Check if a shape is managed by the ShapeManager
   * @param {Phaser.GameObjects.Shape} shape - The shape to check
   * @returns {boolean} - True if the shape is managed, false otherwise
   */
  checkIfShapeManaged(shape) {
    return shape.manager === this.#shapeManager;
  }

  /**
   * Handle a move command by pushing it to the UndoRedoManager
   * Additionally, this method can be overridden to provide custom behavior.
   * @param {MoveShapeCommand} command - The move command to handle
   * @param {Phaser.GameObjects.Shape} _shape - The shape being moved
   * @param {Object} _oldPosition - The old position of the shape
   * @param {Object} _newPosition - The new position of the shape
   * @returns {void}
   * @virtual
   */
  handleMoveCommand(command, _shape, _oldPosition, _newPosition) {
    this.undoRedoManager.pushCommand(command);
  }
  /**
   * Register move events to create MoveShapeCommand instances
   * @returns {void}
   */
  #registerMoveEvents() {
    this.#scene.events.on("shapeMoveStart", (shape) => {
      if (!this.checkIfShapeManaged(shape)) {
        return;
      }

      this.#moveStartData = {
        x: shape.x,
        y: shape.y,
        shape: shape,
      };
    });
    this.#scene.events.on("shapeMoveEnd", (shape) => {
      if (!this.checkIfShapeManaged(shape)) {
        return;
      }

      if (!this.#moveStartData || this.#moveStartData.shape !== shape) {
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
        shape,
        { x: this.#moveStartData.x, y: this.#moveStartData.y },
        moveEndPosition,
      );

      this.handleMoveCommand(
        moveCommand,
        shape,
        { x: this.#moveStartData.x, y: this.#moveStartData.y },
        moveEndPosition,
      );

      this.#moveStartData = null;
    });
  }

  /**
   * Handle a rotate command by pushing it to the UndoRedoManager
   * Additionally, this method can be overridden to provide custom behavior.
   * @param {RotateShapeCommand} command - The rotate command to handle
   * @param {Phaser.GameObjects.Shape} _shape - The shape being rotated
   * @param {number} _oldRotation - The old rotation of the shape
   * @param {number} _newRotation - The new rotation of the shape
   * @returns {void}
   * @virtual
   */
  handleRotateCommand(command, _shape, _oldRotation, _newRotation) {
    this.undoRedoManager.pushCommand(command);
  }

  /**
   * Register rotate events to create RotateShapeCommand instances
   * @returns {void}
   */
  #registerRotateEvents() {
    this.#scene.events.on("shapeRotateStart", (shape) => {
      if (!this.checkIfShapeManaged(shape)) {
        return;
      }

      this.#rotateStartData = {
        rotation: shape.rotation,
        shape: shape,
      };
    });
    this.#scene.events.on("shapeRotateEnd", (shape) => {
      if (!this.checkIfShapeManaged(shape)) {
        return;
      }

      if (!this.#rotateStartData || this.#rotateStartData.shape !== shape) {
        return;
      }

      const rotateEndRotation = shape.rotation;
      if (this.#rotateStartData.rotation === rotateEndRotation) {
        this.#rotateStartData = null;
        return;
      }

      const rotateCommand = new RotateShapeCommand(
        shape,
        this.#rotateStartData.rotation,
        rotateEndRotation,
      );

      this.handleRotateCommand(
        rotateCommand,
        shape,
        this.#rotateStartData.rotation,
        rotateEndRotation,
      );

      this.#rotateStartData = null;
    });
  }

  /**
   * Handle a resize command by pushing it to the UndoRedoManager
   * Additionally, this method can be overridden to provide custom behavior.
   * @param {ResizeShapeCommand} command - The resize command to handle
   * @param {Phaser.GameObjects.Shape} _shape - The shape being resized
   * @param {Object} _oldTransform - The old transform of the shape
   * @param {Object} _newTransform - The new transform of the shape
   * @returns {void}
   * @virtual
   */
  handleResizeCommand(command, _shape, _oldTransform, _newTransform) {
    this.undoRedoManager.pushCommand(command);
  }

  /**
   * Register resize events to create ResizeShapeCommand instances
   * @returns {void}
   */
  #registerResizeEvents() {
    this.#scene.events.on("shapeResizeStart", (shape) => {
      if (!this.checkIfShapeManaged(shape)) {
        return;
      }

      this.#resizeStartData = {
        x: shape.x,
        y: shape.y,
        width: shape.displayWidth,
        height: shape.displayHeight,
        shape: shape,
      };
    });
    this.#scene.events.on("shapeResizeEnd", (shape) => {
      console.log("shapeResizeEnd event caught");
      if (!this.checkIfShapeManaged(shape)) {
        return;
      }

      if (!this.#resizeStartData || this.#resizeStartData.shape !== shape) {
        return;
      }

      const resizeEndTransform = {
        x: shape.x,
        y: shape.y,
        width: shape.displayWidth,
        height: shape.displayHeight,
      };

      if (
        this.#resizeStartData.x === resizeEndTransform.x &&
        this.#resizeStartData.y === resizeEndTransform.y &&
        this.#resizeStartData.width === resizeEndTransform.width &&
        this.#resizeStartData.height === resizeEndTransform.height
      ) {
        this.#resizeStartData = null;
        return;
      }

      console.log(
        "Creating ResizeShapeCommand",
        this.#resizeStartData,
        resizeEndTransform,
      );
      const resizeCommand = new ResizeShapeCommand(
        shape,
        {
          x: this.#resizeStartData.x,
          y: this.#resizeStartData.y,
          width: this.#resizeStartData.width,
          height: this.#resizeStartData.height,
        },
        resizeEndTransform,
      );

      this.handleResizeCommand(
        resizeCommand,
        shape,
        {
          x: this.#resizeStartData.x,
          y: this.#resizeStartData.y,
          width: this.#resizeStartData.width,
          height: this.#resizeStartData.height,
        },
        resizeEndTransform,
      );

      this.#resizeStartData = null;
    });
  }

  /**
   * Handle a shape removed command by pushing it to the UndoRedoManager
   * Additionally, this method can be overridden to provide custom behavior.
   * @param {Object} command - The command to handle
   * @param {Phaser.GameObjects.Shape} _shape - The shape being removed
   * @returns {void}
   * @virtual
   */
  handleShapeRemoved(command, _shape) {
    this.undoRedoManager.pushCommand(command);
  }

  #catchShapeRemoved() {
    this.#scene.events.on("shapeRemoved", (_shape, command) => {
      if (!this.checkIfShapeManaged(_shape)) {
        return;
      }
      if (!command) {
        return;
      }

      this.handleShapeRemoved(command, _shape);
    });
  }
}

export default CreateCommandEventHandler;
