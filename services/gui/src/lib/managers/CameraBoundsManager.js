import SortedLinkedMapList from "@collections/SortedLinkedMapList";
import { calculateBoundingBox, getShapePoints } from "@utils/shapes";

/**
 * Manages camera bounds based on shapes in the scene.
 * @class CameraBoundsManager
 */
class CameraBoundsManager {
  /**
   * The Phaser scene
   * @type {Phaser.Scene}
   */
  #scene;

  /**
   * The Phaser camera this manager controls
   * @type {Phaser.Cameras.Scene2D.Camera}
   */
  #camera;

  /**
   * The initial dimensions of the camera
   * @type {{width: number, height: number}}
   */
  #initialCameraDimensions;
  /**
   * The initial dimensions of the world
   * @type {{width: number, height: number}}
   */
  #initialWorldDimensions;

  /**
   * Event configuration for shape events
   * @type {Object}
   */
  #eventConfig;

  /**
   * Sorted list of minimum X values of shapes
   * @type {SortedLinkedMapList}
   */
  #minXSortedList = new SortedLinkedMapList();
  /**
   * Sorted list of maximum X values of shapes
   * @type {SortedLinkedMapList}
   */
  #maxXSortedList = new SortedLinkedMapList((a, b) => b - a);
  /**
   * Sorted list of minimum Y values of shapes
   * @type {SortedLinkedMapList}
   */
  #minYSortedList = new SortedLinkedMapList();
  /**
   * Sorted list of maximum Y values of shapes
   * @type {SortedLinkedMapList}
   */
  #maxYSortedList = new SortedLinkedMapList((a, b) => b - a);

  /**
   * Creates an instance of CameraBoundsManager.
   * @param {Phaser.Scene} scene - The Phaser scene
   * @param {Phaser.Cameras.Scene2D.Camera} camera - The Phaser camera to manage
   * @param {Object} config - Configuration object
   * @param {number} [config.worldWidth] - Initial world width
   * @param {number} [config.worldHeight] - Initial world height
   * @param {Object} [config.eventConfig] - Event configuration for shape events
   * @params {Object} [config.eventConfig.eventName] - Name of the event to listen for
   * @params {number} [config.eventConfig.eventName.extraPadding=0] - Extra padding to add to bounds on event
   * @params {boolean} [config.eventConfig.eventName.allowShrink=false] - Whether to allow shrinking bounds on event
   */
  constructor(scene, camera, config) {
    this.#scene = scene;
    this.#camera = camera;
    this.#initialCameraDimensions = {
      width: camera.width,
      height: camera.height,
    };
    this.#initialWorldDimensions = {
      width: config.worldWidth || camera.width * 3,
      height: config.worldHeight || camera.height * 3,
    };

    this.#eventConfig = config.eventConfig;
  }

  /**
   * Initializes the camera bounds and registers event listeners.
   * @returns {void}
   */
  create() {
    this.#camera.setBounds(
      -this.#initialCameraDimensions.width,
      -this.#initialCameraDimensions.height,
      this.#initialWorldDimensions.width,
      this.#initialWorldDimensions.height,
    );
    this.#registerEvents(this.#eventConfig || {});
  }

  /**
   * Registers event listeners based on the provided configuration
   *  @param {Object} eventConfig - Configuration object mapping event names to settings
   *  @param {Object} eventConfig.eventName - Configuration for a specific event
   *  @param {number} [eventConfig.eventName.extraPadding=0] - Extra padding to add to bounds on event
   *  @param {boolean} [eventConfig.eventName.allowShrink=false] - Whether to allow shrinking bounds on event
   * @returns {void}
   */
  #registerEvents(eventConfig) {
    Object.entries(eventConfig).forEach(([eventName, config]) => {
      this.#scene.events.on(
        eventName,
        (shape) => this.#handleEvent(shape, config),
        this,
      );
    });
    this.#scene.events.on(
      "shapeRemoved",
      (shape) => {
        this.#removeFromLists(shape);
        //this.#adjustCameraBounds(0, true);
      },
      this,
    );
  }

  /**
   * Handles shape-related events and updates camera bounds
   *  @param {Phaser.GameObjects.Shape} shape - The shape involved in the event
   *  @param {Object} config - Configuration for handling the event
   *  @param {number} [config.extraPadding=0] - Extra padding to add to the bounds
   *  @param {boolean} [config.allowShrink=false] - Whether to allow shrinking the bounds
   *  @returns {void}
   */
  #handleEvent(shape, config) {
    this.#updateLists(shape);
    this.#adjustCameraBounds(
      config.extraPadding || 0,
      config.allowShrink || false,
    );
  }

  /**
   * Adjusts the camera bounds based on the shapes' positions
   * @param {number} [extraSpace=0] - Extra space to add to the bounds
   * @param {boolean} [allowShrink=false] - Whether to allow shrinking the bounds
   * @returns {void}
   */
  #adjustCameraBounds(extraSpace = 0, allowShrink = false) {
    const oldBounds = this.#camera.getBounds();

    let newWorldWidth = oldBounds.width;
    let newWorldHeight = oldBounds.height;
    let newLeft = oldBounds.left;
    let newTop = oldBounds.top;

    let minX = this.#minXSortedList.getHeadValue() - extraSpace;
    minX = Math.min(minX, -this.#initialCameraDimensions.width);
    minX = Math.round(minX);

    const canExpandLeft = minX < oldBounds.left;
    const isShrinkingLeft = minX > oldBounds.left;
    const canShrinkLeft = isShrinkingLeft && allowShrink;

    if (canExpandLeft || canShrinkLeft) {
      newLeft = minX;
      newWorldWidth = oldBounds.right - minX;
    }

    let maxX = this.#maxXSortedList.getHeadValue() + extraSpace;
    maxX = Math.max(
      maxX,
      this.#initialWorldDimensions.width - this.#initialCameraDimensions.width,
    );
    maxX = Math.round(maxX);
    const canExpandRight = maxX > oldBounds.right;
    const isShrinkingRight = maxX < oldBounds.right;
    const canShrinkRight = isShrinkingRight && allowShrink;

    if (canExpandRight || canShrinkRight) {
      newWorldWidth = maxX - oldBounds.left;
    }

    let minY = this.#minYSortedList.getHeadValue() - extraSpace;
    minY = Math.min(minY, -this.#initialCameraDimensions.height);
    minY = Math.round(minY);

    const canExpandTop = minY < oldBounds.top;
    const isShrinkingTop = minY > oldBounds.top;
    const canShrinkTop = isShrinkingTop && allowShrink;
    if (canExpandTop || canShrinkTop) {
      newTop = minY;
      newWorldHeight = oldBounds.bottom - minY;
    }

    let maxY = this.#maxYSortedList.getHeadValue() + extraSpace;
    maxY = Math.max(
      maxY,
      this.#initialWorldDimensions.height -
        this.#initialCameraDimensions.height,
    );
    maxY = Math.round(maxY);
    const canExpandBottom = maxY > oldBounds.bottom;
    const isShrinkingBottom = maxY < oldBounds.bottom;
    const canShrinkBottom = isShrinkingBottom && allowShrink;
    if (canExpandBottom || canShrinkBottom) {
      newWorldHeight = maxY - oldBounds.top;
    }

    if (
      newLeft === oldBounds.left &&
      newTop === oldBounds.top &&
      newWorldWidth === oldBounds.width &&
      newWorldHeight === oldBounds.height
    ) {
      return;
    }

    this.#camera.setBounds(newLeft, newTop, newWorldWidth, newWorldHeight);
    this.#scene.events.emit("cameraBoundsChanged", this.#camera.getBounds());
  }

  /**
   * Updates the sorted lists with the shape's bounding box values
   * @param {Phaser.GameObjects.Shape} shape - The shape to update the lists with
   * @returns {void}
   */
  #updateLists(shape) {
    const boundingBox = calculateBoundingBox([shape], (shape) => {
      const points = Object.values(getShapePoints(shape));
      return points;
    });
    this.#minXSortedList.insert(shape, boundingBox.left);
    this.#minYSortedList.insert(shape, boundingBox.top);
    this.#maxXSortedList.insert(shape, boundingBox.right);
    this.#maxYSortedList.insert(shape, boundingBox.bottom);
  }

  /**
   * Removes the shape's bounding box values from the sorted lists
   * @param {Phaser.GameObjects.Shape} shape - The shape to remove from the lists
   * @returns {void}
   */
  #removeFromLists(shape) {
    this.#minXSortedList.remove(shape);
    this.#minYSortedList.remove(shape);
    this.#maxXSortedList.remove(shape);
    this.#maxYSortedList.remove(shape);
  }
}

export default CameraBoundsManager;
