import Manager from "../Manager";
import { getShapePoints } from "../functions/shapes";

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

    this.moveWorker = new Worker(
      new URL("../../workers/dragWorker.js", import.meta.url),
    );

    this.pending = null;

    this.moveWorker.onmessage = (event) => {
      const { withinBounds } = event.data;
      if (this.pending && withinBounds) {
        this.pending.shape.setPosition(this.pending.dragX, this.pending.dragY);
        this.pending = null;
      }
    };
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
    shape.on("dragstart", () => {
      this.scene.children.bringToTop(shape);
    });

    shape.on("drag", (_, dragX, dragY) => {
      if (this.scene.activeTool === "move") {
        const points = Object.values(getShapePoints(shape));

        this.moveWorker.postMessage({
          points,
          dragX,
          dragY,
          sceneWidth: this.scene.cameras.main.width,
          sceneHeight: this.scene.cameras.main.height,
          shapeX: shape.x,
          shapeY: shape.y,
        });

        this.pending = { shape, dragX, dragY };
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
