/**
 * Manager for camera panning
 * @class PanningManager
 */
class PanningManager {
  /**
   * Flag to indicate if panning is active
   * @type {boolean}
   * @private
   */
  #isPanning = false;

  /**
   * Starting point for panning
   * @type {object|null}
   * @private
   */
  #panStart = null;

  /**
   * Constructor
   * @param {Phaser.Scene} scene - The scene
   */
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Flag to indicate if panning is active
   * @type {boolean}
   * @readonly
   * @public
   * @returns {boolean} The action active flag
   */
  get isPanning() {
    return this.#isPanning;
  }

  /**
   * Adds camera panning events
   * @returns {void}
   * @public
   */
  create() {
    this.scene.input.on("pointerdown", (pointer) => {
      if (pointer.middleButtonDown()) {
        this.#isPanning = true;
        this.#panStart = { x: pointer.x, y: pointer.y };
        this.scene.input.setDefaultCursor("grabbing");
      }
    });

    this.scene.input.on("pointermove", (pointer) => {
      if (this.#isPanning && this.#panStart) {
        const camera = this.scene.cameras.main;

        const deltaX = pointer.x - this.#panStart.x;
        const deltaY = pointer.y - this.#panStart.y;

        camera.scrollX -= deltaX;
        camera.scrollY -= deltaY;

        this.#panStart = { x: pointer.x, y: pointer.y };
      }
    });

    this.scene.input.on("pointerup", (pointer) => {
      if (this.#isPanning && pointer.middleButtonReleased()) {
        this.#isPanning = false;
        this.#panStart = null;
        this.scene.input.setDefaultCursor("default");
      }
    });
  }

  /**
   * Update method
   * @returns {void}
   * @public
   */
  update() {
    const pointer = this.scene.input.activePointer;
    const camera = this.scene.cameras.main;

    const scrollSpeed = 3;
    const edgeSize = 20;

    if (
      pointer.x < 0 ||
      pointer.x > camera.width ||
      pointer.y < 0 ||
      pointer.y > camera.height
    ) {
      this.#isPanning = false;
      this.#panStart = null;
      return;
    }

    if (pointer.leftButtonDown()) {
      if (pointer.x <= edgeSize) {
        camera.scrollX -= scrollSpeed;
        this.#isPanning = true;
      } else if (pointer.x >= camera.width - edgeSize) {
        camera.scrollX += scrollSpeed;
        this.#isPanning = true;
      }
      if (pointer.y <= edgeSize) {
        camera.scrollY -= scrollSpeed;
        this.#isPanning = true;
      } else if (pointer.y >= camera.height - edgeSize) {
        camera.scrollY += scrollSpeed;
        this.#isPanning = true;
      }
    }

    if (!pointer.middleButtonDown() && !pointer.leftButtonDown()) {
      this.#isPanning = false;
      this.#panStart = null;
    }
  }
}

export default PanningManager;
