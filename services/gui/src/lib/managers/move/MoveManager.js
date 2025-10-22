import Manager from "@managers/Manager";
import OutlineManager from "@managers/outlines/OutlineManager";
import { rectangleDottedOutline } from "@managers/outlines/outlines";

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
   */
  #isDragging = false;

  /**
   * The shape currently being moved
   * @type {Phaser.GameObjects.Shape|null}
   * @default null
   */
  #currentlyMoving = null;

  /**
   * Outline manager
   * @type {OutlineManager}
   * @default new OutlineManager(this.scene)
   */
  #outlineManager = new OutlineManager(this.scene);

  /**
   * Constructor
   * @param {Phaser.Scene} scene - The scene
   * @param {OutlineManager} [outlineManager] - Optional outline manager to use
   * @constructor
   * @public
   */
  constructor(scene, outlineManager) {
    super(scene);
    if (outlineManager) {
      this.#outlineManager = outlineManager;
      this.scene.events.on("undoPerformed", () => {
        this.#outlineManager.hideAll();
      });
      this.scene.events.on("redoPerformed", () => {
        this.#outlineManager.hideAll();
      });
    }
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
   * Adds shape drag event
   * @param {Phaser.GameObjects.Shape} shape - Shape to add drag event to
   * @returns {void}
   * @public
   * @override
   */
  create(shape) {
    shape.on("dragstart", () => {
      if (this.scene.activeTool !== "move") {
        return;
      }
      this.#isDragging = true;
      this.#currentlyMoving = shape;
      this.scene.children.bringToTop(shape);
      if (shape.label) {
        shape.label.setToTop();
      }
      this.#outlineManager.create(shape, rectangleDottedOutline);
      this.scene.events.emit("shapeMoveStart", shape);
    });

    shape.on("drag", (_, dragX, dragY) => {
      if (!this.#isDragging) {
        return;
      }

      shape.setPosition(dragX, dragY);
      this.scene.events.emit("shapeMoved", shape);
      this.#outlineManager.update(shape, rectangleDottedOutline);
    });

    shape.on("dragend", () => {
      if (!this.#isDragging) {
        return;
      }
      this.#isDragging = false;
      this.#currentlyMoving = null;
      this.#outlineManager.hide(shape);
      this.scene.events.emit("shapeMoveEnd", shape);
    });
  }

  /**
   * Update method
   * @param {Phaser.GameObjects.Shape} _shape - Shape to update event for
   * @param {number} x - X position override
   * @param {number} y - Y position override
   * @returns {void}
   * @public
   * @override
   */
  update(_shape, x, y) {
    if (this.#currentlyMoving) {
      this.#currentlyMoving.setPosition(x, y);
      this.#outlineManager.update(
        this.#currentlyMoving,
        rectangleDottedOutline,
      );
      this.scene.events.emit("shapeMoved", this.#currentlyMoving);
    }
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
