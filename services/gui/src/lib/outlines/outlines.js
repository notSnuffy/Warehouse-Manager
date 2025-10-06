import Phaser from "phaser";

/**
 * Draws a dotted rectangle outline around a shape
 * @param {Phaser.GameObjects.Graphics} graphics - The graphics object to draw with
 * @param {Phaser.GameObjects.Shape} shape - The shape to draw the outline for
 * @returns {void}
 * @public
 */
function rectangleDottedOutline(graphics, shape) {
  if (!shape) {
    return;
  }
  if (!graphics) {
    return;
  }

  const topLeft = shape.getTopLeft();
  const bottomRight = shape.getBottomRight();
  const topRight = shape.getTopRight();
  const bottomLeft = shape.getBottomLeft();

  const dashLength = 10;
  const gapLength = 5;

  graphics.clear();
  graphics.lineStyle(2, 0x354fde, 1);
  graphics.beginPath();

  function drawDashedLine(x1, y1, x2, y2) {
    const vector1 = new Phaser.Math.Vector2(x1, y1);
    const vector2 = new Phaser.Math.Vector2(x2, y2);

    const direction = vector2.clone().subtract(vector1);
    const distance = direction.length();

    const directionNormalized = direction.clone().normalize();

    const dashCount = Math.floor(distance / (dashLength + gapLength));

    const dashVector = directionNormalized.clone().scale(dashLength);
    const gapVector = directionNormalized.clone().scale(gapLength);

    const currentVector = vector1.clone();
    for (let i = 0; i < dashCount; i++) {
      const nextVector = currentVector.clone().add(dashVector);
      graphics.moveTo(currentVector.x, currentVector.y);
      graphics.lineTo(nextVector.x, nextVector.y);
      currentVector.add(dashVector).add(gapVector);
    }
    graphics.moveTo(currentVector.x, currentVector.y);
    graphics.lineTo(x2, y2);
  }
  drawDashedLine(topLeft.x, topLeft.y, topRight.x, topRight.y);
  drawDashedLine(topRight.x, topRight.y, bottomRight.x, bottomRight.y);
  drawDashedLine(bottomRight.x, bottomRight.y, bottomLeft.x, bottomLeft.y);
  drawDashedLine(bottomLeft.x, bottomLeft.y, topLeft.x, topLeft.y);

  graphics.closePath();
  graphics.strokePath();
}

export { rectangleDottedOutline };
