import Manager from "@managers/Manager";
import RotationManager from "@managers/rotation/RotationManager";
import ResizeManager from "@managers/resize/ResizeManager";

/**
 * Manager for selecting shapes
 * @memberof module:select
 * @class SelectShapeManager
 * @extends Manager
 */
class SelectShapeManager extends Manager {
  /**
   * Last selected shape
   * @type {Phaser.GameObjects.Shape}
   * @private
   * @default null
   */
  #lastSelected = null;

  /**
   * Rotation manager
   * @type {RotationManager}
   * @private
   * @default null
   */
  #rotationManager = null;

  /**
   * Resize manager
   * @type {ResizeManager}
   * @private
   * @default null
   */
  #resizeManager = null;

  /**
   * Constructor for the SelectShapeManager
   * @param {Phaser.Scene} scene - The scene
   */
  constructor(scene) {
    super(scene);
    this.#rotationManager = new RotationManager(scene);
    this.#resizeManager = new ResizeManager(scene);

    this.#rotationManager.addManagerToUpdate(this.#resizeManager);
    this.#resizeManager.addManagerToUpdate(this.#rotationManager);

    this.scene.input.on("pointerdown", (pointer) => {
      const hitShapes = this.scene.input.hitTestPointer(pointer);

      if (hitShapes.length === 0) {
        this.hide();
      }
    });
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
    return this.scene.activeTool === "select";
  }

  /**
   * Flag to indicate if resizing is active
   * @type {boolean}
   * @readonly
   * @public
   * @returns {boolean} The resizing active flag
   */
  get isResizing() {
    return this.#resizeManager.actionActive;
  }

  /**
   * Adds shape select event
   * @param {Phaser.GameObjects.Shape} shape - The shape to add select event to
   * @returns {void}
   * @public
   * @override
   */
  create(shape) {
    shape.on("pointerdown", () => {
      if (this.scene.activeTool === "select") {
        this.hide();

        //shape.setFillStyle(0xffffff);
        this.#lastSelected = shape;

        this.scene.children.bringToTop(shape);
        this.scene.events.emit("shapeSelected", shape);
        this.#resizeManager.create(shape);
        this.#rotationManager.create(shape);
      }
    });
  }

  /**
   * Update method
   * @returns {void}
   * @public
   * @override
   */
  update(dragX, dragY) {
    this.#resizeManager.updateOnOutsideDrag(this.#lastSelected, dragX, dragY);
  }

  /**
   * Handles the unselect event
   * @returns {void}
   * @public
   * @override
   */
  hide() {
    if (
      (this.#rotationManager && this.#rotationManager.actionActive) ||
      (this.#resizeManager && this.#resizeManager.actionActive)
    ) {
      return;
    }

    if (this.#lastSelected) {
      this.#lastSelected = null;
    }

    this.#rotationManager.hide();
    this.#resizeManager.hide();
  }
}

export default SelectShapeManager;
