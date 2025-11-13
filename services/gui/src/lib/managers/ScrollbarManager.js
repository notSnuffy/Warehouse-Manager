/**
 * ScrollbarManager
 * A class to manage horizontal and vertical scrollbars for a Phaser camera.
 * @class ScrollbarManager
 */
class ScrollbarManager {
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
   * The horizontal scrollbar element
   * @type {HTMLInputElement}
   */
  #scrollHorizontal;

  /**
   * The vertical scrollbar element
   * @type {HTMLInputElement}
   */
  #scrollVertical;

  /**
   * Event names to listen to for updating scrollbars
   * @type {string[]}
   */
  #eventNames;

  /**
   * The initial dimensions of the world
   * @type {{width: number, height: number}}
   */
  #initialWorldDimensions;

  /**
   * Map of event listeners for shape events
   * @type {Map<HTMLInputElement, {eventName: string, listener: Function}>}
   */
  #htmlEventListeners = new Map();

  /**
   * Map of scene event listeners
   * @type {Map<string, Function>}
   */
  #sceneEventListeners = new Map();

  /**
   * Constructor
   * @param {Phaser.Scene} scene - The scene
   * @param {Phaser.Cameras.Scene2D.Camera} camera - The camera
   * @param {HTMLInputElement} scrollHorizontal - The horizontal scrollbar element
   * @param {HTMLInputElement} scrollVertical - The vertical scrollbar element
   * @param {Object} config - Configuration object
   * @param {string[]} [config.eventNames] - Event names to listen to for updating scrollbars
   * @param {number} [config.worldWidth] - Initial world width
   * @param {number} [config.worldHeight] - Initial world height
   */
  constructor(scene, camera, scrollHorizontal, scrollVertical, config) {
    this.#scene = scene;
    this.#camera = camera;
    this.#scrollHorizontal = scrollHorizontal;
    this.#scrollVertical = scrollVertical;
    this.#eventNames = config.eventNames || [];
    this.#initialWorldDimensions = {
      width: config.worldWidth || camera.width * 3,
      height: config.worldHeight || camera.height * 3,
    };
  }

  /**
   * Initializes the scrollbars
   * @returns {void}
   */
  #initializeScrollbars() {
    this.#scrollHorizontal.max =
      this.#initialWorldDimensions.width - this.#camera.width;
    this.#scrollVertical.max =
      this.#initialWorldDimensions.height - this.#camera.height;

    this.#scrollHorizontal.value = this.#camera.width;
    this.#scrollVertical.value = this.#camera.height;
    this.#initializeScrollbarsListeners();
  }

  /**
   * Initializes the scrollbars listeners
   * @returns {void}
   */
  #initializeScrollbarsListeners() {
    const horizontalListener = (event) => {
      const value = parseInt(event.target.value, 10);
      this.#camera.centerOnX(
        this.#camera.getBounds().left + value + this.#camera.displayWidth / 2,
      );
    };
    this.#scrollHorizontal.addEventListener("input", horizontalListener);
    const verticalListener = (event) => {
      const value = parseInt(event.target.value, 10);
      this.#camera.centerOnY(
        this.#camera.getBounds().top + value + this.#camera.displayHeight / 2,
      );
    };
    this.#scrollVertical.addEventListener("input", verticalListener);

    this.#htmlEventListeners.set(this.#scrollHorizontal, {
      eventName: "input",
      listener: horizontalListener,
    });
    this.#htmlEventListeners.set(this.#scrollVertical, {
      eventName: "input",
      listener: verticalListener,
    });
  }

  /**
   * Updates the scrollbars based on the camera's current view
   * @returns {void}
   */
  #updateScrollbars() {
    const bounds = this.#camera.getBounds();
    this.#scrollHorizontal.max = bounds.width - this.#camera.displayWidth;
    this.#scrollVertical.max = bounds.height - this.#camera.displayHeight;

    this.#scrollHorizontal.value =
      Math.abs(bounds.left) +
      this.#camera.worldView.centerX -
      this.#camera.displayWidth / 2;
    this.#scrollVertical.value =
      Math.abs(this.#camera.getBounds().top) +
      this.#camera.worldView.centerY -
      this.#camera.displayHeight / 2;
  }

  /**
   * Registers event listeners for updating scrollbars
   * @returns {void}
   */
  #registerEventListeners() {
    const listener = () => {
      this.#updateScrollbars();
    };

    this.#eventNames.forEach((eventName) => {
      this.#scene.events.on(eventName, listener, this);
      this.#sceneEventListeners.set(eventName, listener);
    });
  }

  /**
   * Initializes the ScrollbarManager
   * @returns {void}
   * @public
   */
  create() {
    this.#initializeScrollbars();
    this.#registerEventListeners();
  }

  /**
   * Destroys the ScrollbarManager and removes all event listeners
   * @returns {void}
   */
  destroy() {
    this.#htmlEventListeners.forEach(({ eventName, listener }, element) => {
      element.removeEventListener(eventName, listener);
    });
    this.#sceneEventListeners.forEach((listener, eventName) => {
      this.#scene.events.off(eventName, listener, this);
    });

    this.#htmlEventListeners.clear();
    this.#sceneEventListeners.clear();
    this.#scene = null;
    this.#camera = null;
    this.#scrollHorizontal = null;
    this.#scrollVertical = null;
    this.#initialWorldDimensions = null;
    this.#eventNames = null;
  }
}

export default ScrollbarManager;
