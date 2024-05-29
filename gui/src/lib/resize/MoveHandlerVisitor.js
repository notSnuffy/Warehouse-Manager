import HandleVisitor from "./HandleVisitor";
import { getResizedPoints } from "./math";

/**
 * @memberof module:types
 * @typedef {Object} StaticPoints
 * @property {Point} topLeft - The top left point
 * @property {Point} topRight - The top right point
 * @property {Point} bottomLeft - The bottom left point
 * @property {Point} bottomRight - The bottom right point
 * @property {Point} topCenter - The top center point
 * @property {Point} bottomCenter - The bottom center point
 * @property {Point} leftCenter - The left center point
 * @property {Point} rightCenter - The right center point
 */

/**
 * Move handler visitor
 * @extends HandleVisitor
 * @public
 */
class MoveHandlerVisitor extends HandleVisitor {
  /**
   * The static points
   * @type {StaticPoints}
   * @private
   * @default {}
   */
  #staticPoints;

  /**
   * The expected corner point after resize
   * @type {Point}
   * @private
   */
  #expectedPoint;

  /**
   * The rotation in radians
   * @type {number}
   * @private
   */
  #rotation;

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
   * @type {Shape}
   * @private
   */
  #result;

  /**
   * The result
   * @type {Shape}
   * @public
   * @default {}
   */
  get result() {
    return this.#result;
  }

  /**
   * Constructor
   * @param {StaticPoints} staticPoints - The static points
   * @param {Point} expectedPoint - The expected corner point after resize
   * @param {number} rotation - The rotation in radians
   * @param {Object} fixedDimension - The fixed dimension
   * @public
   */
  constructor(staticPoints, expectedPoint, rotation, _fixedDimension = {}) {
    super();
    this.#staticPoints = staticPoints;
    this.#expectedPoint = expectedPoint;
    this.#rotation = rotation;
    //this.#fixedDimension = fixedDimension;
  }

  /**
   * Visit the top left handle
   * @param {TopLeftHandler} handle
   * @returns {}
   * @public
   * @override
   */
  visitTopLeft(handle) {
    return handle;
  }

  /**
   * Visit the top right handle
   * @param {Handle} handle
   * @returns {Handle}
   * @public
   */
  visitTopRight(handle) {
    return handle;
  }

  /**
   * Visit the bottom left handle
   * @param {Handle} handle
   * @returns {Handle}
   * @public
   */
  visitBottomLeft(handle) {
    return handle;
  }

  /**
   * Visit the bottom right handle
   * @param {BottomRightHandle} handle
   * @returns {Shape} New dimension of the shape
   * @public
   * @override
   */
  visitBottomRight(handle) {
    const newDimensions = getResizedPoints(
      handle,
      this.#staticPoints.topLeft,
      this.#expectedPoint,
      this.#rotation,
    );
    this.#result = newDimensions;
  }

  /**
   * Visit the top center handle
   * @param {Handle} handle
   * @returns {Handle}
   * @public
   */
  visitTopCenter(handle) {
    return handle;
  }

  /**
   * Visit the bottom center handle
   * @param {Handle} handle
   * @returns {Handle}
   * @public
   */
  visitBottomCenter(handle) {
    return handle;
  }

  /**
   * Visit the left center handle
   * @param {Handle} handle
   * @returns {Handle}
   * @public
   */
  visitLeftCenter(handle) {
    return handle;
  }

  /**
   * Visit the right center handle
   * @param {Handle} handle
   * @returns {Handle}
   * @public
   */
  visitRightCenter(handle) {
    return handle;
  }
}

export default MoveHandlerVisitor;
