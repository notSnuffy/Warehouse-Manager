import Phaser from "phaser";
import { getRealPosition, getRealDimensions } from "@utils/shapes";

/**
 * Wrapper for Phaser's Container class.
 * @class
 * @extends Phaser.GameObjects.Container
 */
class Container extends Phaser.GameObjects.Container {
  /**
   * Creates an instance of Container.
   * @param {Phaser.Scene} scene - The scene to which this container belongs.
   * @param {number} [x=0] - The x-coordinate of the container.
   * @param {number} [y=0] - The y-coordinate of the container.
   * @param {Phaser.GameObjects.GameObject[]} - An array of child game objects to add to the container.
   */
  constructor(scene, x = 0, y = 0, children) {
    super(scene, x, y, children);
    this.scene.add.existing(this);
  }

  /**
   * Function to calculate the edge point of the container based on local coordinates.
   * @param {number} localX - The local x-coordinate relative to the container.
   * @param {number} localY - The local y-coordinate relative to the container.
   * @return {Object} An object containing the global x and y coordinates of the edge point.
   * @private
   */
  #calculateEdgePoint(localX, localY) {
    const { tx, ty } = this.getWorldTransformMatrix();
    const globalX = tx;
    const globalY = ty;
    const rotatedLocalX =
      localX * Math.cos(this.rotation) - localY * Math.sin(this.rotation);
    const rotatedLocalY =
      localX * Math.sin(this.rotation) + localY * Math.cos(this.rotation);
    const containerX = globalX + rotatedLocalX;
    const containerY = globalY + rotatedLocalY;
    return { x: containerX, y: containerY };
  }

  /**
   * Gets the top-left corner of the container.
   * @return {Object} An object containing the global x and y coordinates of the top-left corner.
   */
  getTopLeft() {
    return this.#calculateEdgePoint(
      -this.displayWidth / 2,
      -this.displayHeight / 2,
    );
  }

  /**
   * Gets the top-right corner of the container.
   * @return {Object} An object containing the global x and y coordinates of the top-right corner.
   */
  getTopRight() {
    return this.#calculateEdgePoint(
      this.displayWidth / 2,
      -this.displayHeight / 2,
    );
  }

  /**
   * Gets the bottom-left corner of the container.
   * @return {Object} An object containing the global x and y coordinates of the bottom-left corner.
   */
  getBottomLeft() {
    return this.#calculateEdgePoint(
      -this.displayWidth / 2,
      this.displayHeight / 2,
    );
  }
  /**
   * Gets the bottom-right corner of the container.
   * @return {Object} An object containing the global x and y coordinates of the bottom-right corner.
   */
  getBottomRight() {
    return this.#calculateEdgePoint(
      this.displayWidth / 2,
      this.displayHeight / 2,
    );
  }

  /**
   * Gets the left-center point of the container.
   * @return {Object} An object containing the global x and y coordinates of the left-center point.
   */
  getLeftCenter() {
    return this.#calculateEdgePoint(-this.displayWidth / 2, 0);
  }

  /**
   * Gets the right-center point of the container.
   * @return {Object} An object containing the global x and y coordinates of the right-center point.
   */
  getRightCenter() {
    return this.#calculateEdgePoint(this.displayWidth / 2, 0);
  }
  /**
   * Gets the top-center point of the container.
   * @return {Object} An object containing the global x and y coordinates of the top-center point.
   */
  getTopCenter() {
    return this.#calculateEdgePoint(0, -this.displayHeight / 2);
  }

  /**
   * Gets the bottom-center point of the container.
   * @return {Object} An object containing the global x and y coordinates of the bottom-center point.
   */
  getBottomCenter() {
    return this.#calculateEdgePoint(0, this.displayHeight / 2);
  }

  /**
   * Gets the center point of the container.
   * @return {Object} An object containing the global x and y coordinates of the center point.
   */
  getCenter() {
    const { tx, ty } = this.getWorldTransformMatrix();
    return { x: tx, y: ty };
  }

  /**
   * Creates a snapshot of the container's current state.
   * @returns {Object} An object representing the snapshot of the container.
   */
  createSnapshot() {
    let position;
    let dimensions;
    if (this.parentContainer) {
      position = getRealPosition(this, this.parentContainer);
      dimensions = getRealDimensions(this);
    } else {
      position = { x: this.x, y: this.y };
      dimensions = {
        width: this.displayWidth,
        height: this.displayHeight,
      };
    }

    return {
      type: "container",
      params: {
        x: position.x,
        y: position.y,
        width: dimensions.width,
        height: dimensions.height,
        rotation: this.rotation,
        children: this.list
          .map((child) => {
            if (typeof child.createSnapshot === "function") {
              return child.createSnapshot();
            }
            return null;
          })
          .filter((child) => child !== null),
      },
      metadata: {
        ...this.metadata,
      },
      additionalData: {
        id: this.internalId,
        interactive: this.input?.enabled ? this.interactiveData : null,
      },
    };
  }
}

export default Container;
