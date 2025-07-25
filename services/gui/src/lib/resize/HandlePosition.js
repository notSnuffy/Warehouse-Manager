/**
 * Enum for the positions of the handles
 * @type {Object}
 * @readonly
 * @enum {number}
 * @property {number} TOP_LEFT - Top left corner
 * @property {number} TOP_RIGHT - Top right corner
 * @property {number} BOTTOM_RIGHT - Bottom right corner
 * @property {number} BOTTOM_LEFT - Bottom left corner
 * @property {number} TOP_CENTER - Top edge center
 * @property {number} RIGHT_CENTER - Right edge center
 * @property {number} BOTTOM_CENTER - Bottom edge center
 * @property {number} LEFT_CENTER - Left edge center
 */
const HANDLE_POSITION = Object.freeze({
  TOP_LEFT: 0,
  TOP_RIGHT: 1,
  BOTTOM_RIGHT: 2,
  BOTTOM_LEFT: 3,
  TOP_CENTER: 4,
  RIGHT_CENTER: 5,
  BOTTOM_CENTER: 6,
  LEFT_CENTER: 7,
});

export default HANDLE_POSITION;
