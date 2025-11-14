import Phaser from "phaser";

/**
 * UndoRedoManager class to handle undo and redo operations using the Command pattern.
 * @class UndoRedoManager
 */
class UndoRedoManager {
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
   * The event emitter instance.
   * @type {Phaser.Events.EventEmitter}
   */
  #eventEmitter;

  /**
   * Creates an instance of UndoRedoManager.
   * @param {number} [maxStackSize=50] - Maximum size of the undo/redo stacks.
   */
  constructor(maxStackSize = 50) {
    this.#maxStackSize = maxStackSize;

    this.#eventEmitter = new Phaser.Events.EventEmitter();
  }

  /**
   * Adds an event listener.
   * @param {string} event - The event name
   * @param {Function} listener - The event listener function
   * @param {Object} [context=this] - The context to bind the listener to
   * @return {void}
   */
  on(event, listener, context = this) {
    this.#eventEmitter.on(event, listener, context);
  }

  /**
   * Removes an event listener.
   * @param {string} event - The event name
   * @param {Function} [listener=null] - Only remove listeners that match this function
   * @param {Object} [context=null] - Only remove listeners that match this context
   * @param {boolean} [once=null] - If true, only remove once listeners
   * @return {void}
   */
  off(event, listener = null, context = null, once = null) {
    this.#eventEmitter.off(event, listener, context, once);
  }

  /**
   * Emits an event.
   * @param {string} event - The event name
   * @param {any[]} args - Arguments to pass to the event listeners
   * @return {void}
   */
  emit(event, ...args) {
    this.#eventEmitter.emit(event, ...args);
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

    this.emit("commandPushed", this.getStackSizes());
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

    this.emit("undoPerformed", this.getStackSizes());
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
    this.emit("redoPerformed", this.getStackSizes());
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
