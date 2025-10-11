/**
 * Base class for handle visitors
 */
class HandleVisitor {
  /**
   * Visit the top left handle
   * @param {Handle} handle
   * @returns {Handle}
   * @public
   * @abstract
   */
  visitTopLeft(handle) {
    return handle;
  }

  /**
   * Visit the top right handle
   * @param {Handle} handle
   * @returns {Handle}
   * @public
   * @abstract
   */
  visitTopRight(handle) {
    return handle;
  }

  /**
   * Visit the bottom left handle
   * @param {Handle} handle
   * @returns {Handle}
   * @public
   * @abstract
   */
  visitBottomLeft(handle) {
    return handle;
  }

  /**
   * Visit the bottom right handle
   * @param {Handle} handle
   * @returns {Handle}
   * @public
   * @abstract
   */
  visitBottomRight(handle) {
    return handle;
  }

  /**
   * Visit the top center handle
   * @param {Handle} handle
   * @returns {Handle}
   * @public
   * @abstract
   */
  visitTopCenter(handle) {
    return handle;
  }

  /**
   * Visit the bottom center handle
   * @param {Handle} handle
   * @returns {Handle}
   * @public
   * @abstract
   */
  visitBottomCenter(handle) {
    return handle;
  }

  /**
   * Visit the left center handle
   * @param {Handle} handle
   * @returns {Handle}
   * @public
   * @abstract
   */
  visitLeftCenter(handle) {
    return handle;
  }

  /**
   * Visit the right center handle
   * @param {Handle} handle
   * @returns {Handle}
   * @public
   * @abstract
   */
  visitRightCenter(handle) {
    return handle;
  }
}

export default HandleVisitor;
