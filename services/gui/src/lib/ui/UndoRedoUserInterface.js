/**
 * Class that manages the user interface for undo and redo operations.
 * @class UndoRedoUserInterface
 */
class UndoRedoUserInterface {
  /**
   * The scene where the UI is used.
   * @type {Phaser.Scene}
   */
  #scene;

  /**
   * The undo/redo manager instance.
   * @type {UndoRedoManager}
   */
  #undoRedoManager;

  /**
   * The undo button element.
   * @type {HTMLInputElement}
   */
  #undoButton;

  /**
   * The redo button element.
   * @type {HTMLInputElement}
   */
  #redoButton;

  /**
   * Creates an instance of UndoRedoUserInterface.
   * @param {Phaser.Scene} scene - The scene where the UI is used.
   * @param {UndoRedoManager} undoRedoManager - The undo/redo manager instance.
   * @param {string} undoButtonId - The ID of the undo button element.
   * @param {string} redoButtonId - The ID of the redo button element.
   */
  constructor(scene, undoRedoManager, undoButtonId, redoButtonId) {
    this.#scene = scene;
    this.#undoRedoManager = undoRedoManager;

    this.#undoButton = document.getElementById(undoButtonId);
    this.#redoButton = document.getElementById(redoButtonId);

    this.#initializeButtonHandlers();
    this.#initializeEventListeners();
    this.#updateButtonStates();
  }

  /**
   * Initializes button handlers for undo and redo buttons.
   * @return {void}
   */
  #initializeButtonHandlers() {
    this.#undoButton.addEventListener("click", async () => {
      await this.#undoRedoManager.undo();
    });
    this.#redoButton.addEventListener("click", async () => {
      await this.#undoRedoManager.redo();
    });
  }

  /**
   * Initializes event listeners for undo and redo events.
   * @return {void}
   */
  #initializeEventListeners() {
    this.#scene.events.on("undoPerformed", () => {
      this.#updateButtonStates();
    });
    this.#scene.events.on("redoPerformed", () => {
      this.#updateButtonStates();
    });
    this.#scene.events.on("commandPushed", () => {
      this.#updateButtonStates();
    });
  }

  /**
   * Updates the states of the undo and redo buttons.
   * @return {void}
   */
  #updateButtonStates() {
    this.#undoButton.disabled = !this.#undoRedoManager.canUndo();
    this.#redoButton.disabled = !this.#undoRedoManager.canRedo();
  }
}

export default UndoRedoUserInterface;
