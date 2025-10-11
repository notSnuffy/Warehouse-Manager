import Phaser from "phaser";

/**
 * Calculate the center point between two points
 * @memberof module:points
 * @param {Point} point1 - The first point
 * @param {Point} point2 - The second point
 * @returns {Point} The center point
 * @example
 * const point1 = { x: 0, y: 0 };
 * const point2 = { x: 2, y: 2 };
 * const centerPoint = calculateCenterPoint(point1, point2);
 * // centerPoint = { x: 1, y: 1 }
 */
function calculateCenterPoint(point1, point2) {
  return {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2,
  };
}

/**
 * Given a point, rotation, and distance, calculate a point in that distance and that angle
 * @memberof module:points
 * @param {Point} x0 Starting x coordinate
 * @param {Point} y0 Starting y coordinate
 * @param {number} rotation Rotation in radians
 * @param {number} distance Distance to rotate
 * @returns {Point} The rotated point
 */
function rotatePointTo(x0, y0, rotation, distance) {
  return {
    x: x0 + distance * Math.cos(rotation),
    y: y0 + distance * Math.sin(rotation),
  };
}

/**
 * Get the direction vector between two points
 * @memberof module:points
 * @param {Point} point1 - The first point
 * @param {Point} point2 - The second point
 * @returns {Phaser.Math.Vector2} The direction vector
 */
function getDirectionVector(point1, point2) {
  return new Phaser.Math.Vector2(point2.x - point1.x, point2.y - point1.y);
}

export { calculateCenterPoint, rotatePointTo, getDirectionVector };
