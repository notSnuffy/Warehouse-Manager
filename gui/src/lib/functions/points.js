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

export { calculateCenterPoint };
