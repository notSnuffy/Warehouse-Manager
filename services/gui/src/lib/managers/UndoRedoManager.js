class UndoRedoManager {
  #scene;

  #undoStack = [];
  #redoStack = [];
  constructor(scene) {
    this.#scene = scene;
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

  pushCommand(command) {
    this.#undoStack.push(command);
    this.#redoStack = [];
  }

  async undo() {
    if (this.#undoStack.length === 0) {
      console.warn("No commands to undo.");
      return;
    }

    const command = this.#undoStack.pop();
    await command.undo();
    this.#redoStack.push(command);
    this.#scene.events.emit("undoPerformed");
  }

  async redo() {
    if (this.#redoStack.length === 0) {
      console.warn("No commands to redo.");
      return;
    }

    const command = this.#redoStack.pop();
    await command.execute();
    this.#undoStack.push(command);
    this.#scene.events.emit("redoPerformed");
  }

  clear() {
    this.#undoStack = [];
    this.#redoStack = [];
  }
}

export default UndoRedoManager;
