import Handle from "./Handle";

/**
 * Handle class for resizing the bottom left corner
 * @class
 * @extends Handle
 */
class BottomLeftHandle extends Handle {
  /**
   * Constructor for the BottomLeftHandle class
   * @constructor
   * @param {number} x - The x coordinate of the handle
   * @param {number} y - The y coordinate of the handle
   * @param {number} width - The width of the handle
   * @param {number} height - The height of the handle
   */
  constructor(x, y, width, height) {
    super(x, y, width, height);
  }

  /**
   * Accept a visitor
   * @param {HandleVisitor} visitor
   * @public
   * @override
   */
  accept(visitor) {
    return visitor.visitBottomLeft(this);
  }
}

export default BottomLeftHandle;
