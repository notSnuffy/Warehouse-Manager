/**
 * Converts unsigned degrees to signed radians.
 *
 * @param {number} degrees - The angle in degrees.
 * @returns {number} The angle in radians, normalized to the range [-π, π].
 */
function convertDegreesToRadiansSigned(degrees) {
  let normalizedDegrees = degrees % 360;
  if (normalizedDegrees > 180) {
    normalizedDegrees -= 360;
  }
  return normalizedDegrees * (Math.PI / 180);
}

export { convertDegreesToRadiansSigned };
