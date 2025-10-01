import Manager from "../Manager";

/**
 * Manage the movement of shapes
 * @memberof module:move
 * @class MoveManager
 * @extends Manager
 */
class MoveManager extends Manager {
  /**
   * Flag to indicate if dragging is active
   * @type {boolean}
   * @private
   */
  #isDragging = false;

  /**
   * The shape currently being moved
   * @type {Phaser.GameObjects.Shape|null}
   * @private
   * @default null
   */
  #currentlyMoving = null;

  /**
   * Constructor
   * @param {Phaser.Scene} scene - The scene
   * @constructor
   * @public
   */
  constructor(scene) {
    super(scene);
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
    return this.scene.activeTool === "move";
  }

  /**
   * Flag to indicate if dragging is active
   * @type {boolean}
   * @readonly
   * @public
   * @returns {boolean} The dragging active flag
   */
  get isDragging() {
    return this.#isDragging;
  }

  /**
   * The shape currently being moved
   * @type {Phaser.GameObjects.Shape|null}
   * @readonly
   * @public
   * @returns {Phaser.GameObjects.Shape|null} The shape currently being moved
   */
  get currentlyMoving() {
    return this.#currentlyMoving;
  }

  /**
   * Adds shape drag event
   * @param {Phaser.GameObjects.Shape} shape - Shape to add drag event to
   * @returns {void}
   * @public
   * @override
   */
  create(shape) {
    shape.on("dragstart", () => {
      this.#isDragging = true;
      this.#currentlyMoving = shape;
      this.scene.children.bringToTop(shape);
      if (shape.label) {
        shape.label.setToTop();
      }
    });

    shape.on("drag", (_, dragX, dragY) => {
      if (this.scene.activeTool === "move") {
        shape.setPosition(dragX, dragY);
        this.scene.events.emit("shapeMoved", shape);
      }
    });

    shape.on("dragend", () => {
      this.#isDragging = false;
      this.#currentlyMoving = null;
    });
  }

  /**
   * Update method
   * @param {Phaser.GameObjects.Shape} shape - The shape to update event for
   * @returns {void}
   * @public
   * @override
   */
  update() {
    return;
  }

  /**
   * Hide method
   * @returns {void}
   * @public
   * @override
   */
  hide() {
    return;
  }
}

export default MoveManager;
