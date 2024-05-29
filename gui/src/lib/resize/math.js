import Phaser from "phaser";
import { calculateCenterPoint } from "../functions/points";
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
 * @param {Object} point1 - The first point
 * @param {Object} point2 - The second point
 * @param {Object} fixedDimension - The fixed dimension
 * @returns {Array} The adjusted dimension
 * @example
 * const point1 = { x: 0, y: 0 };
 * const point2 = { x: 2, y: 2 };
 * const fixedDimension = { width: 2 };
 * const adjustedDimension = adjustDimension(point1, point2, fixedDimension);
 */
function adjustDimension(handle, point1, point2, fixedDimension = {}) {
  const moveDimensionVisitor = new MoveDimensionVisitor(
    point1,
    point2,
    fixedDimension,
  );

  console.log(handle);
  handle.accept(moveDimensionVisitor);
  console.log(moveDimensionVisitor);

  const newSize = moveDimensionVisitor.result;

  // if (type === 0) {
  //   newWidth = point2.x - point1.x;
  //   newHeight = point1.y - point2.y;
  // } else if (type === 1) {
  //   newWidth = point1.x - point2.x;
  //   newHeight = point2.y - point1.y;
  // } else {
  //   newWidth = point2.x - point1.x;
  //   newHeight = point2.y - point1.y;
  // }

  // if (fixedDimension.width) {
  //   newWidth = fixedDimension.width;
  // }

  // if (fixedDimension.height) {
  //   newHeight = fixedDimension.height;
  // }

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
 * @param {Object} fixedDimension - The fixed dimension
 * @returns {Shape} The resized points + dimensions
 */
function getResizedPoints(
  handle,
  staticPoint,
  expectedPoint,
  rotation,
  fixedDimension = {},
) {
  const newCenter = calculateCenterPoint(staticPoint, expectedPoint);
  console.log(staticPoint, expectedPoint, newCenter);

  const [adjustedStaticPoint, adjustedExpectedPoint] = adjustPoints(
    [staticPoint, expectedPoint],
    newCenter,
    -rotation,
  );

  const [newWidth, newHeight] = adjustDimension(
    handle,
    adjustedStaticPoint,
    adjustedExpectedPoint,
    fixedDimension,
  );

  return {
    x: newCenter.x,
    y: newCenter.y,
    width: newWidth,
    height: newHeight,
  };
}

export { getResizedPoints };
