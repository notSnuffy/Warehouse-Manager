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
   * Map of shape IDs to their corresponding labels.
   * @type {Map<Phaser.GameObjects.Shape, Phaser.GameObjects.Text>}
   */
  #labels = new Map();

  /**
   * Constructor
   * @param {Phaser.Scene} scene - The Phaser scene instance
   */
  constructor(scene) {
    this.#scene = scene;

    this.#initializeLabelEvents();
  }

  /**
   * Initializes event listeners for shape events to manage label positions and lifecycle.
   * @return {void}
   */
  #initializeLabelEvents() {
    this.#scene.events.on("shapeMoveStart", (shape) => {
      const label = this.#labels.get(shape);
      if (label) {
        label.setToTop();
      }
    });
    this.#scene.events.on("shapeMoved", (shape) => {
      const label = this.#labels.get(shape);
      if (label) {
        label.setPosition(shape.x, shape.y);
        label.setToTop();
      }
    });
    this.#scene.events.on("shapeSelected", (shape) => {
      const label = this.#labels.get(shape);
      if (label) {
        label.setToTop();
      }
    });
    this.#scene.events.on("shapeResized", (shape) => {
      const label = this.#labels.get(shape);
      if (label) {
        label.setPosition(shape.x, shape.y);
        label.setToTop();
      }
    });
    this.#scene.events.on("shapeRemoved", (shape, command) => {
      if (command) {
        return;
      }

      const label = this.#labels.get(shape);
      if (label) {
        label.destroy();
        this.#labels.delete(shape);
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
   * @param {Phaser.GameObjects.Shape} shape - The shape to add the label to
   * @param {string} labelText - The text of the label
   * @param {string} labelColor - The color of the label text
   * @param {Function} updateCallback - Callback function to call after updating the label
   * @return {void}
   */
  addLabel(shape, labelText, labelColor, updateCallback) {
    this.removeLabel(shape);

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

    this.#labels.set(shape, label);
  }

  /**
   * Adds a label to a shape from a snapshot.
   * @param {Phaser.GameObjects.Shape} shape - The shape to add the label to
   * @param {Object} snapshot - The snapshot object containing label properties
   * @param {string} snapshot.text - The text of the label
   * @param {number} snapshot.x - The x position of the label
   * @param {number} snapshot.y - The y position of the label
   * @param {Object} snapshot.style - The style object for the label
   * @param {Function} snapshot.updateCallback - Callback function to call after updating the label
   * @return {void}
   */
  addLabelFromSnapshot(shape, snapshot) {
    this.removeLabel(shape);

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

    this.#labels.set(shape, label);
  }

  /**
   * Removes the label associated with a shape.
   * @param {Phaser.GameObjects.Shape} shape - The shape whose label is to be removed
   * @return {void}
   */
  removeLabel(shape) {
    const label = this.#labels.get(shape);
    if (label) {
      label.destroy();
      this.#labels.delete(shape);
    }
  }

  /**
   * Gets the label associated with a shape.
   * @param {Phaser.GameObjects.Shape} shape - The shape whose label is to be retrieved
   * @return {Phaser.GameObjects.Text|undefined} The label associated with the shape, or undefined if none exists
   */
  getLabel(shape) {
    return this.#labels.get(shape);
  }
}

export default ShapeLabeler;
