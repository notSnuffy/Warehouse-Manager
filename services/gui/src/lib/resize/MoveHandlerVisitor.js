import HandleVisitor from "./HandleVisitor";
import { getResizedPoints } from "./math";
import Phaser from "phaser";

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
   * The fixed dimensions
   * @type {Object}
   * @private
   * @default {}
   */
  #fixedDimensions;

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
   * @param {Object} fixedDimensions - The fixed dimensions
   * @public
   */
  constructor(staticPoints, expectedPoint, rotation, fixedDimensions) {
    super();
    this.#staticPoints = staticPoints;
    this.#expectedPoint = expectedPoint;
    this.#rotation = rotation;
    this.#fixedDimensions = fixedDimensions;
  }

  /**
   * Visit the top left handle
   * @param {TopLeftHandler} handle
   * @public
   * @override
   */
  visitTopLeft(handle) {
    const newDimensions = getResizedPoints(
      handle,
      this.#staticPoints.bottomRight,
      this.#expectedPoint,
      this.#rotation,
    );
    this.#result = newDimensions;
  }

  /**
   * Visit the top right handle
   * @param {TopRightHandle} handle
   * @public
   */
  visitTopRight(handle) {
    const newDimensions = getResizedPoints(
      handle,
      this.#staticPoints.bottomLeft,
      this.#expectedPoint,
      this.#rotation,
    );
    this.#result = newDimensions;
  }

  /**
   * Visit the bottom left handle
   * @param {BottomRightHandle} handle
   * @public
   */
  visitBottomLeft(handle) {
    const newDimensions = getResizedPoints(
      handle,
      this.#staticPoints.topRight,
      this.#expectedPoint,
      this.#rotation,
    );
    this.#result = newDimensions;
  }

  /**
   * Visit the bottom right handle
   * @param {BottomRightHandle} handle
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
   * @param {TopCenterHandle} handle
   * @public
   */
  visitTopCenter(handle) {
    const line = new Phaser.Geom.Line(
      this.#staticPoints.bottomCenter.x,
      this.#staticPoints.bottomCenter.y,
      this.#staticPoints.topCenter.x,
      this.#staticPoints.topCenter.y,
    );
    const adjustedCornerPoint = Phaser.Geom.Line.GetNearestPoint(
      line,
      this.#expectedPoint,
    );

    const newDimensions = getResizedPoints(
      handle,
      this.#staticPoints.bottomCenter,
      adjustedCornerPoint,
      this.#rotation,
      this.#fixedDimensions.topCenter,
    );
    this.#result = newDimensions;
  }

  /**
   * Visit the bottom center handle
   * @param {BottomCenterHandle} handle
   * @override
   * @public
   */
  visitBottomCenter(handle) {
    const line = new Phaser.Geom.Line(
      this.#staticPoints.topCenter.x,
      this.#staticPoints.topCenter.y,
      this.#staticPoints.bottomCenter.x,
      this.#staticPoints.bottomCenter.y,
    );
    const adjustedCornerPoint = Phaser.Geom.Line.GetNearestPoint(
      line,
      this.#expectedPoint,
    );

    const newDimensions = getResizedPoints(
      handle,
      this.#staticPoints.topCenter,
      adjustedCornerPoint,
      this.#rotation,
      this.#fixedDimensions.bottomCenter,
    );
    this.#result = newDimensions;
  }

  /**
   * Visit the left center handle
   * @param {LeftCenterHandle} handle
   * @override
   * @public
   */
  visitLeftCenter(handle) {
    const line = new Phaser.Geom.Line(
      this.#staticPoints.rightCenter.x,
      this.#staticPoints.rightCenter.y,
      this.#staticPoints.leftCenter.x,
      this.#staticPoints.leftCenter.y,
    );
    const adjustedCornerPoint = Phaser.Geom.Line.GetNearestPoint(
      line,
      this.#expectedPoint,
    );

    const newDimensions = getResizedPoints(
      handle,
      this.#staticPoints.rightCenter,
      adjustedCornerPoint,
      this.#rotation,
      this.#fixedDimensions.leftCenter,
    );
    this.#result = newDimensions;
  }

  /**
   * Visit the right center handle
   * @param {RightCenterHandle} handle
   * @override
   * @public
   */
  visitRightCenter(handle) {
    const line = new Phaser.Geom.Line(
      this.#staticPoints.leftCenter.x,
      this.#staticPoints.leftCenter.y,
      this.#staticPoints.rightCenter.x,
      this.#staticPoints.rightCenter.y,
    );
    const adjustedCornerPoint = Phaser.Geom.Line.GetNearestPoint(
      line,
      this.#expectedPoint,
    );

    const newDimensions = getResizedPoints(
      handle,
      this.#staticPoints.leftCenter,
      adjustedCornerPoint,
      this.#rotation,
      this.#fixedDimensions.rightCenter,
    );
    this.#result = newDimensions;
  }
}

export default MoveHandlerVisitor;
