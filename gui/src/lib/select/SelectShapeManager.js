import Manager from "../Manager";
import RotationManager from "../rotation/RotationManager";
import ResizeManager from "../resize/ResizeManager";

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
   * Adds shape select event
   * @param {Phaser.GameObjects.Shape} shape - The shape to add select event to
   * @returns {void}
   * @public
   * @override
   */
  create(shape) {
    shape.on("pointerdown", (pointer, x, y, event) => {
      event.stopPropagation();
      if (this.scene.activeTool === "select") {
        this.hide();

        shape.setFillStyle(0xffffff);
        this.#lastSelected = shape;

        this.scene.children.bringToTop(shape);
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
  update() {
    return;
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
      this.#lastSelected.setFillStyle(0xff0000);
      this.#lastSelected = null;
    }

    this.#rotationManager.hide();
    this.#resizeManager.hide();
  }
}

export default SelectShapeManager;
