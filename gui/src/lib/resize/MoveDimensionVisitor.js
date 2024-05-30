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
   */
  #fixedDimension;

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
  constructor(staticPoint, expectedPoint, fixedDimension) {
    super();
    this.#staticPoint = staticPoint;
    this.#expectedPoint = expectedPoint;
    this.#fixedDimension = fixedDimension;
  }

  /**
   * Visit the top left handle
   * @param {TopLeftHandle} handle
   * @override
   * @public
   */
  visitTopLeft(_handle) {
    const newWidth = this.#staticPoint.x - this.#expectedPoint.x;
    const newHeight = this.#staticPoint.y - this.#expectedPoint.y;

    this.#result = {
      newWidth,
      newHeight,
    };
  }

  /**
   * Visit the top right handle
   * @param {TopRightHandle} handle
   * @override
   * @public
   */
  visitTopRight(_handle) {
    const newWidth = this.#expectedPoint.x - this.#staticPoint.x;
    const newHeight = this.#staticPoint.y - this.#expectedPoint.y;

    this.#result = {
      newWidth,
      newHeight,
    };
  }

  /**
   * Visit the bottom right handle
   * @param {BottomRightHandle} handle
   * @override
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
   * @override
   * @public
   */
  visitBottomLeft(_handle) {
    const newWidth = this.#staticPoint.x - this.#expectedPoint.x;
    const newHeight = this.#expectedPoint.y - this.#staticPoint.y;

    this.#result = {
      newWidth,
      newHeight,
    };
  }

  /**
   * Visit the top center handle
   * @param {TopCenterHandle} handle
   * @override
   * @public
   */
  visitTopCenter(_handle) {
    const newWidth = this.#fixedDimension.width;
    const newHeight = this.#staticPoint.y - this.#expectedPoint.y;

    this.#result = {
      newWidth,
      newHeight,
    };
  }

  /**
   * Visit the bottom center handle
   * @param {BottomCenterHandle} handle
   * @override
   * @public
   */
  visitBottomCenter(_handle) {
    const newWidth = this.#fixedDimension.width;
    const newHeight = this.#expectedPoint.y - this.#staticPoint.y;

    this.#result = {
      newWidth,
      newHeight,
    };
  }

  /**
   * Visit the left center handle
   * @param {LeftCenterHandle} handle
   * @override
   * @public
   */
  visitLeftCenter(_handle) {
    const newWidth = this.#staticPoint.x - this.#expectedPoint.x;
    const newHeight = this.#fixedDimension.height;

    this.#result = {
      newWidth,
      newHeight,
    };
  }

  /**
   * Visit the right center handle
   * @param {RightCenterHandle} handle
   * @override
   * @public
   */
  visitRightCenter(_handle) {
    const newWidth = this.#expectedPoint.x - this.#staticPoint.x;
    const newHeight = this.#fixedDimension.height;

    this.#result = {
      newWidth,
      newHeight,
    };
  }
}

export default MoveDimensionVisitor;
