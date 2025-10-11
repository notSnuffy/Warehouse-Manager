/**
 * Manager class for inheritance
 * @class Manager
 */
class Manager {
  /**
   * Constructor
   * @param {Phaser.Scene} scene - The scene
   */
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Flag to indicate if an action is active
   * @type {boolean}
   * @readonly
   * @public
   * @returns {boolean} The action active flag
   */
  get actionActive() {
    throw new Error("Property 'actionActive' must be implemented.");
  }

  /**
   * Create method
   * @param {Phaser.GameObjects.Shape} shape - The shape to create event for
   * @returns {void}
   * @virtual
   */
  create(_shape) {
    throw new Error("Method 'create()' must be implemented.");
  }

  /**
   * Update method
   * @returns {void}
   * @param {Phaser.GameObjects.Shape} shape - The shape to update event for
   * @virtual
   */
  update(_shape) {
    throw new Error("Method 'update()' must be implemented.");
  }

  /**
   * Hide method
   * @returns {void}
   * @virtual
   */
  hide() {
    throw new Error("Method 'destroy()' must be implemented.");
  }
}

export default Manager;
