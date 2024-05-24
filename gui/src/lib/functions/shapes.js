/**
 * Retrieves the key points of a shape
 * @memberof module:shapes
 * @param {Phaser.GameObjects.Shape} shape - The shape to get points from
 * @returns {Object} An object containing the key points of the shape
 */
function getShapePoints(shape) {
  return {
    topLeft: shape.getTopLeft(),
    topRight: shape.getTopRight(),
    bottomLeft: shape.getBottomLeft(),
    bottomRight: shape.getBottomRight(),
    leftCenter: shape.getLeftCenter(),
    rightCenter: shape.getRightCenter(),
    topCenter: shape.getTopCenter(),
    bottomCenter: shape.getBottomCenter(),
  };
}

export { getShapePoints };
