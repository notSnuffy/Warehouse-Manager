/**
 * Handle class for resizing
 * @class
 *
 */
class Handle {
  /**
   * The x coordinate of the handle
   * @type {number}
   */
  x;
  /**
   * The y coordinate of the handle
   * @type {number}
   */
  y;
  /**
   * The width of the handle
   * @type {number}
   */
  width;
  /**
   * The height of the handle
   * @type {number}
   */
  height;

  /**
   * Constructor for the Handle class
   * @constructor
   * @param {number} x - The x coordinate of the handle
   * @param {number} y - The y coordinate of the handle
   * @param {number} width - The width of the handle
   * @param {number} height - The height of the handle
   * @public
   */
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  /**
   * Accept a visitor
   * @param {HandleVisitor} _visitor
   * @public
   * @abstract
   */
  accept(_visitor) {
    throw new Error("Method not implemented.");
  }
}

export default Handle;
