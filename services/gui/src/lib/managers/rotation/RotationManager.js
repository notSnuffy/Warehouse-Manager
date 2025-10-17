import Manager from "@managers/Manager";

/**
 * Radius of the rotation knob
 * @memberof module:rotation
 * @type {number}
 */
const ROTATION_KNOB_RADIUS = 10;

class RotationManager extends Manager {
  /**
   * Flag to indicate if the knob is being dragged
   * @type {boolean}
   * @default false
   */
  #knobDragging = false;
  /**
   * Rotation knob
   * @type {Phaser.GameObjects.Shape}
   * @private
   * @default null
   */
  #rotationKnob = null;

  /**
   * Array of managers that need to be updated when rotation
   * @type {Manager[]}
   * @private
   * @default []
   */
  #managersToUpdate = [];

  /**
   * Constructor for RotationManager
   * @param {Phaser.Scene} scene - The scene
   */
  constructor(scene) {
    super(scene);
  }

  /**
   * Add a manager to the list of managers to update
   * @param {Manager} manager - The manager to add
   * @returns {void}
   * @public
   */
  addManagerToUpdate(manager) {
    this.#managersToUpdate.push(manager);
  }

  /**
   * Flag to indicate if an action is active
   * @type {boolean}
   * @readonly
   * @public
   * @returns {boolean} The action active flag
   * @override
   */
  get actionActive() {
    return this.#knobDragging;
  }

  /**
   * Calculate rotation knob position
   * @param {Phaser.GameObjects.Shape} shape - Shape to calculate position for
   * @returns {Point} The position of the rotation knob
   */
  #calculateRotationKnobPosition(shape) {
    const topCenter = shape.getTopCenter();
    return {
      x:
        topCenter.x +
        ROTATION_KNOB_RADIUS * 2 * Math.cos(shape.rotation - Math.PI / 2),
      y:
        topCenter.y +
        ROTATION_KNOB_RADIUS * 2 * Math.sin(shape.rotation - Math.PI / 2),
    };
  }

  /**
   * Updates the rotation knob
   * @param {Phaser.GameObjects.Shape} shape - Shape to update the rotation knob for
   * @returns {void}
   */
  update(shape) {
    const rotationKnobPosition = this.#calculateRotationKnobPosition(shape);
    this.#rotationKnob.setPosition(
      rotationKnobPosition.x,
      rotationKnobPosition.y,
    );
  }
  /**
   * Handles the rotation drag event
   * @param {Phaser.GameObjects.Shape} shape - Shape to rotate
   * @returns {Function} - Event handler
   *
   */
  #handleRotationDrag(shape) {
    return (_, dragX, dragY) => {
      shape.rotation =
        Math.atan2(dragY - shape.y, dragX - shape.x) + Math.PI / 2;
      this.update(shape);
      this.scene.events.emit("shapeRotated", shape);
      this.#managersToUpdate.forEach((manager) => {
        manager.update(shape);
      });
    };
  }

  /**
   * Creates the rotation knob
   * @param {Phaser.GameObjects.Shape} shape - Shape to create the rotation knob for
   * @param {Phaser.Scene} scene - Scene to create the rotation knob in
   * @returns {void}
   * @override
   */
  create(shape) {
    const rotationKnobPosition = this.#calculateRotationKnobPosition(shape);
    this.#rotationKnob = this.scene.add
      .circle(
        rotationKnobPosition.x,
        rotationKnobPosition.y,
        ROTATION_KNOB_RADIUS,
        0x888888,
      )
      .setInteractive({ draggable: true });

    this.#rotationKnob.on("dragstart", () => {
      this.#knobDragging = true;
    });

    this.#rotationKnob.on("drag", this.#handleRotationDrag(shape));

    this.#rotationKnob.on("dragend", () => {
      this.#knobDragging = false;
    });
  }

  /**
   * Hides the rotation knob
   * @returns {void}
   * @override
   */
  hide() {
    if (this.#rotationKnob) {
      this.#rotationKnob.destroy();
      this.#rotationKnob = null;
    }
  }
}

export default RotationManager;
