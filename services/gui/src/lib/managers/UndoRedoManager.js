/**
 * UndoRedoManager class to handle undo and redo operations using the Command pattern.
 * @class UndoRedoManager
 */
class UndoRedoManager {
  /**
   * The scene where the manager is used.
   * @type {Phaser.Scene}
   */
  #scene;

  /**
   * Stack of commands for undo operations.
   * @type {Array<BaseCommand>}
   */
  #undoStack = [];

  /**
   * Maximum size of the undo/redo stacks.
   * @type {number}
   * @default 50
   */
  #maxStackSize = 50;

  /**
   * Stack of commands for redo operations.
   * @type {Array<BaseCommand>}
   */
  #redoStack = [];

  /**
   * Creates an instance of UndoRedoManager.
   * @param {Phaser.Scene} scene - The scene where the manager is used.
   * @param {number} [maxStackSize=50] - Maximum size of the undo/redo stacks.
   */
  constructor(scene, maxStackSize = 50) {
    this.#scene = scene;
    this.#maxStackSize = maxStackSize;

    this.#scene.input.keyboard.on("keydown-Z", async (event) => {
      if (event.ctrlKey) {
        await this.undo();
      }
    });
    this.#scene.input.keyboard.on("keydown-Y", async (event) => {
      if (event.ctrlKey) {
        await this.redo();
      }
    });
  }

  /**
   * Pushes a command onto the undo stack and clears the redo stack.
   * @param {BaseCommand} command - The command to push onto the undo stack.
   * @returns {void}
   */
  pushCommand(command) {
    this.#undoStack.push(command);
    this.#redoStack = [];

    if (this.#undoStack.length > this.#maxStackSize) {
      this.#undoStack.shift();
    }

    this.#scene.events.emit("commandPushed", this.getStackSizes());
  }

  /**
   * Undoes the last command.
   * @returns {Promise<void>}
   */
  async undo() {
    if (!this.canUndo()) {
      console.warn("No commands to undo.");
      return;
    }

    const command = this.#undoStack.pop();
    await command.undo();
    this.#redoStack.push(command);

    this.#scene.events.emit("undoPerformed", this.getStackSizes());
  }

  /**
   * Redoes the last undone command.
   * @return {Promise<void>}
   */
  async redo() {
    if (!this.canRedo()) {
      console.warn("No commands to redo.");
      return;
    }

    const command = this.#redoStack.pop();
    await command.execute();
    this.#undoStack.push(command);
    this.#scene.events.emit("redoPerformed", this.getStackSizes());
  }

  /**
   * Clears both the undo and redo stacks.
   * @returns {void}
   */
  clear() {
    this.#undoStack = [];
    this.#redoStack = [];
  }

  /**
   * Checks if there are commands available to undo.
   * @returns {boolean} True if there are commands to undo, false otherwise.
   */
  canUndo() {
    return this.#undoStack.length > 0;
  }

  /**
   * Checks if there are commands available to redo.
   * @returns {boolean} True if there are commands to redo, false otherwise.
   */
  canRedo() {
    return this.#redoStack.length > 0;
  }

  /**
   * Gets the sizes of the undo and redo stacks.
   * @returns {Object} An object containing the sizes of the undo and redo stacks.
   */
  getStackSizes() {
    return {
      undoStackSize: this.#undoStack.length,
      redoStackSize: this.#redoStack.length,
    };
  }
}

export default UndoRedoManager;
