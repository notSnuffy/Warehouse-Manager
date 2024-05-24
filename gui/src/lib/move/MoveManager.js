import Manager from "../Manager";

/**
 * Manage the movement of shapes
 * @memberof module:move
 * @class MoveManager
 * @extends Manager
 */
class MoveManager extends Manager {
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
   * Adds shape drag event
   * @param {Phaser.GameObjects.Shape} shape - Shape to add drag event to
   * @returns {void}
   * @public
   * @override
   */
  create(shape) {
    shape.on("drag", (_, dragX, dragY) => {
      if (this.scene.activeTool === "move") {
        let height = shape.height;
        let width = shape.width;
        if (
          dragY >= height / 2 &&
          dragY + height / 2 < this.scene.cameras.main.height &&
          dragX + width / 2 < this.scene.cameras.main.width &&
          dragX >= width / 2
        ) {
          shape.setPosition(dragX, dragY);
        }
      }
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
