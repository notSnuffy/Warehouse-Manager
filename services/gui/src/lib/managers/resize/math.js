import Phaser from "phaser";
import { calculateCenterPoint } from "@utils/points";
import MoveDimensionVisitor from "./MoveDimensionVisitor";

/**
 * @memberof module:types
 * @typedef {Object} Point
 * @property {number} x - The x coordinate
 * @property {number} y - The y coordinate
 */

/**
 * Adjust the points around a center point by a rotation
 * @memberof module:resize
 * @param {Point[]} points - The points to adjust
 * @param {Point} center - The center point
 * @param {number} rotation - The rotation in radians
 * @returns {Point[]} The adjusted points
 * @example
 * const points = [{ x: 0, y: 0 }, { x: 2, y: 0 }];
 * const center = { x: 1, y: 1 };
 * const rotation = Math.PI / 2;
 * const adjustedPoints = adjustPoints(points, center, rotation);
 */
function adjustPoints(points, center, rotation) {
  return points.map((point) =>
    Phaser.Math.RotateAround(point, center.x, center.y, rotation),
  );
}

/**
 * Adjust the dimension of a shape
 * @memberof module:resize
 * @param {Handle} handle - The handle
 * @param {Point} point1 - The first point
 * @param {Point} point2 - The second point
 * @param {Object} fixedDimensions - The fixed dimensions
 * @returns {Array} The adjusted dimension
 */
function adjustDimension(handle, point1, point2, fixedDimensions) {
  const moveDimensionVisitor = new MoveDimensionVisitor(
    point1,
    point2,
    fixedDimensions,
  );

  handle.accept(moveDimensionVisitor);

  const newSize = moveDimensionVisitor.result;

  return [newSize.newWidth, newSize.newHeight];
}

/**
 * @memberof module:types
 * @typedef {Object} Shape
 * @property {number} x - The x coordinate
 * @property {number} y - The y coordinate
 * @property {number} width - The width
 * @property {number} height - The height
 */

/**
 * Calculate the resized points + dimensions
 * @memberof module:resize
 * @param {Handle} handle - The handle
 * @param {Point} staticPoint - The static point
 * @param {Point} expectedPoint - The expected point
 * @param {number} rotation - The rotation in radians
 * @param {Object} fixedDimensions - The fixed dimensions
 * @returns {Shape} The resized points + dimensions
 */
function getResizedPoints(
  handle,
  staticPoint,
  expectedPoint,
  rotation,
  fixedDimensions,
) {
  const newCenter = calculateCenterPoint(staticPoint, expectedPoint);

  const [adjustedStaticPoint, adjustedExpectedPoint] = adjustPoints(
    [staticPoint, expectedPoint],
    newCenter,
    -rotation,
  );

  const [newWidth, newHeight] = adjustDimension(
    handle,
    adjustedStaticPoint,
    adjustedExpectedPoint,
    fixedDimensions,
  );

  return {
    x: newCenter.x,
    y: newCenter.y,
    width: newWidth,
    height: newHeight,
  };
}

export { getResizedPoints };
