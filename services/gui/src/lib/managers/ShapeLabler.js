class ShapeLabler {
  #scene;
  #labels = new Map();
  constructor(scene) {
    this.#scene = scene;

    this.#initializeLabelEvents();
  }

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
    this.#scene.events.on("shapeRemoved", (shapeId) => {
      const label = this.#labels.get(shapeId);
      if (label) {
        label.destroy();
        this.#labels.delete(shapeId);
      }
    });
    this.#scene.events.on("shapeAdded", (shape) => {
      const label = this.#labels.get(shape.internalId);
      if (label) {
        return;
      }

      if (
        !shape.metadata &&
        !shape.metadata.zoneName &&
        !shape.metadata.labelColor
      ) {
        return;
      }

      this.addLabel(
        shape,
        shape.metadata.zoneName,
        shape.metadata.labelColor || "#ffffff",
        (shape, newLabelText) => {
          shape.metadata.zoneName = newLabelText;
        },
      );
    });
  }

  #promptLabelEdit(shape, label, updateCallback) {
    const newLabelText = prompt("Enter new label text:", label.text);
    if (newLabelText !== null) {
      label.setText(newLabelText);
    }
    updateCallback(shape, newLabelText);
  }

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

    this.#labels.set(shape.internalId, label);
  }

  removeLabel(shape) {
    const label = this.#labels.get(shape.internalId);
    if (label) {
      label.destroy();
      this.#labels.delete(shape.internalId);
    }
  }
}

export default ShapeLabler;
