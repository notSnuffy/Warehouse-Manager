/**
 * ShapeLabeler class manages labels for shapes within a Phaser scene.
 * @class ShapeLabeler
 */
class ShapeLabeler {
  /**
   * The Phaser scene instance.
   * @type {Phaser.Scene}
   */
  #scene;

  /**
   * The ShapeManager instance.
   * @type {ShapeManager}
   */
  #shapeManager;

  /**
   * Map of shape IDs to their corresponding labels.
   * @type {Map<string, Phaser.GameObjects.Text>}
   */
  #labels = new Map();

  /**
   * Constructor
   * @param {Phaser.Scene} scene - The Phaser scene instance
   * @param {ShapeManager} shapeManager - The ShapeManager instance
   */
  constructor(scene, shapeManager) {
    this.#scene = scene;
    this.#shapeManager = shapeManager;

    this.#initializeLabelEvents();
  }

  /**
   * Initializes event listeners for shape events to manage label positions and lifecycle.
   * @return {void}
   */
  #initializeLabelEvents() {
    this.#scene.events.on("shapeMoveStart", (shape) => {
      const label = this.#labels.get(shape.internalId);
      if (label) {
        label.setToTop();
      }
    });
    this.#scene.events.on("shapeMoved", (shape) => {
      const label = this.#labels.get(shape.internalId);
      if (label) {
        label.setPosition(shape.x, shape.y);
        label.setToTop();
      }
    });
    this.#scene.events.on("shapeSelected", (shape) => {
      const label = this.#labels.get(shape.internalId);
      if (label) {
        label.setToTop();
      }
    });
    this.#scene.events.on("shapeResized", (shape) => {
      const label = this.#labels.get(shape.internalId);
      if (label) {
        label.setPosition(shape.x, shape.y);
        label.setToTop();
      }
    });
    this.#scene.events.on("shapeRemoved", (shapeId, command, manager) => {
      if (command || manager) {
        return;
      }

      const label = this.#labels.get(shapeId);
      if (label) {
        label.destroy();
        this.#labels.delete(shapeId);
      }
    });
  }

  /**
   * Prompts the user to edit the label text.
   * @param {Phaser.GameObjects.Shape} shape - The shape associated with the label
   * @param {Phaser.GameObjects.Text} label - The label to edit
   * @param {Function} updateCallback - Callback function to call after updating the label
   * @return {void}
   */
  #promptLabelEdit(shape, label, updateCallback) {
    const newLabelText = prompt("Enter new label text:", label.text);
    if (newLabelText === null) {
      return;
    }
    if (newLabelText.trim() === "") {
      alert("Label text cannot be empty.");
      return;
    }
    if (newLabelText === label.text) {
      return;
    }

    label.setText(newLabelText);
    updateCallback(shape, newLabelText);
    console.log(shape.metadata.zoneName, newLabelText);
  }

  /**
   * Adds a label to a shape.
   * @param {string} shapeId - The ID of the shape
   * @param {string} labelText - The text of the label
   * @param {string} labelColor - The color of the label text
   * @param {Function} updateCallback - Callback function to call after updating the label
   * @return {void}
   */
  addLabel(shapeId, labelText, labelColor, updateCallback) {
    this.removeLabel(shapeId);

    console.log(this.#shapeManager);
    const shape = this.#shapeManager.getShapeById(shapeId);

    const label = this.#scene.add.text(shape.x, shape.y, labelText, {
      fontSize: "16px",
      color: labelColor,
      backgroundColor: "#000000",
    });
    label.setOrigin(0.5, 0.5);
    label.setToTop();

    label.setInteractive({ useHandCursor: true });
    label.on("pointerdown", (pointer) => {
      if (!pointer.leftButtonDown()) {
        return;
      }

      const lastTapTime = label._lastTapTime || 0;
      const clickDelay = this.#scene.time.now - lastTapTime;
      label._lastTapTime = this.#scene.time.now;
      if (clickDelay < 300) {
        const shape = this.#shapeManager.getShapeById(shapeId);

        this.#promptLabelEdit(shape, label, updateCallback);
      }
    });

    label.createSnapshot = function () {
      return {
        text: this.text,
        x: this.x,
        y: this.y,
        style: { ...this.style },
        updateCallback: updateCallback,
      };
    };

    this.#labels.set(shapeId, label);
  }

  addLabelFromSnapshot(shapeId, snapshot) {
    this.removeLabel(shapeId);

    const label = this.#scene.add.text(
      snapshot.x,
      snapshot.y,
      snapshot.text,
      snapshot.style,
    );
    label.setOrigin(0.5, 0.5);
    label.setToTop();

    label.setInteractive({ useHandCursor: true });
    label.on("pointerdown", (pointer) => {
      if (!pointer.leftButtonDown()) {
        return;
      }

      const lastTapTime = label._lastTapTime || 0;
      const clickDelay = this.#scene.time.now - lastTapTime;
      label._lastTapTime = this.#scene.time.now;
      if (clickDelay < 300) {
        const shape = this.#shapeManager.getShapeById(shapeId);

        this.#promptLabelEdit(shape, label, snapshot.updateCallback);
      }
    });

    label.createSnapshot = function () {
      return {
        text: this.text,
        x: this.x,
        y: this.y,
        style: { ...this.style },
        updateCallback: snapshot.updateCallback,
      };
    };

    this.#labels.set(shapeId, label);
  }

  /**
   * Removes the label associated with a shape.
   * @param {string} shapeId - The ID of the shape
   * @return {void}
   */
  removeLabel(shapeId) {
    const label = this.#labels.get(shapeId);
    if (label) {
      label.destroy();
      this.#labels.delete(shapeId);
    }
  }

  /**
   * Gets the label associated with a shape.
   * @param {string} shapeId - The ID of the shape
   * @return {Phaser.GameObjects.Text|undefined} The label associated with the shape, or undefined if none exists
   */
  getLabel(shapeId) {
    return this.#labels.get(shapeId);
  }
}

export default ShapeLabeler;
