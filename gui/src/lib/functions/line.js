/**
 * Get line equation coefficients
 * @memberof module:line
 * @param {Phaser.Math.Vector2} A - The first point
 * @param {Phaser.Math.Vector2} B - The second point
 * @returns {Object} The line equation coefficients
 */
function getLineEquation(A, B) {
  let a = B.y - A.y;
  let b = A.x - B.x;
  let c = B.x * A.y - A.x * B.y;
  return { a, b, c };
}

/**
 * Get line value
 * @memberof module:line
 * @param {Object} lineCoefficients - The line coefficients
 * @param {Point} point - The point
 * @returns {number} The line value
 */
function getLineValue(lineCoefficients, point) {
  return (
    lineCoefficients.a * point.x +
    lineCoefficients.b * point.y +
    lineCoefficients.c
  );
}

export { getLineEquation, getLineValue };
