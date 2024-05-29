import HandleVisitor from "./HandleVisitor";

/**
 * Move dimension visitor
 * @extends HandleVisitor
 * @class
 */
class MoveDimensionVisitor extends HandleVisitor {
  /**
   * The static point
   * @type {Point}
   * @private
   * @default {}
   */
  #staticPoint;

  /**
   * The expected corner point after resize
   * @type {Point}
   * @private
   * @default {}
   */
  #expectedPoint;

  /**
   * The fixed dimension
   * @type {Object}
   * @private
   * @default {}
   * @example
   * const fixedDimension = { width: 2 };
   * const fixedDimension = { height: 2 };
   * const fixedDimension = { width: 2, height: 2 };
   */
  //#fixedDimension;

  /**
   * The result
   * @type {Object}
   * @private
   * @default {}
   * @example
   * const result = { width: 2, height: 2 };
   */
  #result;

  /**
   * The result
   * @type {Object}
   * @public
   * @default {}
   */
  get result() {
    return this.#result;
  }

  /**
   * Constructor
   * @param {Point} staticPoint - The static point
   * @param {Point} expectedPoint - The expected corner point after resize
   * @param {Object} fixedDimension - The fixed dimension
   * @public
   */
  constructor(staticPoint, expectedPoint, _fixedDimension = {}) {
    super();
    this.#staticPoint = staticPoint;
    this.#expectedPoint = expectedPoint;
    //this.#fixedDimension = fixedDimension;
  }

  /**
   * Visit the top left handle
   * @param {TopLeftHandle} handle
   * @public
   */
  visitTopLeft(_handle) {}

  /**
   * Visit the top right handle
   * @param {TopRightHandle} handle
   * @public
   */
  visitTopRight(_handle) {}

  /**
   * Visit the bottom right handle
   * @param {BottomRightHandle} handle
   * @public
   */
  visitBottomRight(_handle) {
    const newWidth = this.#expectedPoint.x - this.#staticPoint.x;
    const newHeight = this.#expectedPoint.y - this.#staticPoint.y;

    this.#result = {
      newWidth,
      newHeight,
    };
  }

  /**
   * Visit the bottom left handle
   * @param {BottomLeftHandle} handle
   * @public
   */
  visitBottomLeft(_handle) {}
}

export default MoveDimensionVisitor;
