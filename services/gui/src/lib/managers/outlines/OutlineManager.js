/**
 * Callback function to draw the outline for a shape
 * @callback drawOutlineCallback
 * @param {Phaser.GameObjects.Graphics} graphics - The graphics object to draw with
 * @param {Phaser.GameObjects.Shape} shape - The shape to draw the outline for
 * @returns {void}
 */

/**
 * Manager for creating and managing outlines around shapes
 * @Class OutlineManager
 * @Extends Manager
 */
class OutlineManager {
  /**
   * Map of outlines
   * @type {Map<Phaser.GameObjects.Shape, Phaser.GameObjects.Graphics>}
   * @default new Map()
   */
  #outlines = new Map();

  /**
   * Constructor
   * @param {Phaser.Scene} scene - The scene
   */
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Creates an outline for a given shape if it doesn't already exist
   * @param {Phaser.GameObjects.Shape} shape - The shape to create outline for
   * @param {drawOutlineCallback} drawOutline - Function to draw the outline
   * @returns {void}
   */
  create(shape, drawOutline) {
    if (!shape || this.#outlines.has(shape)) {
      return;
    }
    if (!drawOutline || typeof drawOutline !== "function") {
      console.warn("drawOutline must be a valid function.");
      return;
    }

    const outline = this.scene.add.graphics();
    outline.setDepth(shape.depth + 1);

    this.#outlines.set(shape, outline);
    drawOutline(outline, shape);
  }

  /**
   * Update the outline for a given shape
   * @param {Phaser.GameObjects.Shape} shape - The shape to update event for
   * @param {drawOutlineCallback} drawOutline - Function to draw the outline
   * @returns {void}
   */
  update(shape, drawOutline) {
    if (!shape || !this.#outlines.has(shape)) {
      return;
    }
    if (!drawOutline || typeof drawOutline !== "function") {
      console.warn("drawOutline must be a valid function.");
      return;
    }

    const outline = this.#outlines.get(shape);
    outline.clear();
    drawOutline(outline, shape);
  }

  /**
   * Hide and remove the outline for a given shape
   * @param {Phaser.GameObjects.Shape} shape - The shape to hide the outline for
   * @returns {void}
   */
  hide(shape) {
    if (!shape || !this.#outlines.has(shape)) {
      return;
    }
    const outline = this.#outlines.get(shape);
    outline.destroy();
    this.#outlines.delete(shape);
  }

  /**
   * Hide and remove all outlines
   * @returns {void}
   */
  hideAll() {
    this.#outlines.forEach((outline, _shape) => {
      outline.destroy();
    });
    this.#outlines.clear();
  }
}

export default OutlineManager;
