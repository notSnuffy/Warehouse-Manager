import Phaser from "phaser";
/**
 * Size of the handles
 * @type {number}
 */
const HANDLE_SIZE = 10;

const Corner = Object.freeze({
  TOP_LEFT: 0,
  TOP_RIGHT: 1,
  BOTTOM_RIGHT: 2,
  BOTTOM_LEFT: 3,
});

const Edge = Object.freeze({
  TOP: 4,
  RIGHT: 5,
  BOTTOM: 6,
  LEFT: 7,
});

function constructHandles(shape) {
  const bottomLeft = shape.getBottomLeft();
  const bottomRight = shape.getBottomRight();
  const topLeft = shape.getTopLeft();
  const topRight = shape.getTopRight();
  const topCenter = shape.getTopCenter();
  const bottomCenter = shape.getBottomCenter();
  const leftCenter = shape.getLeftCenter();
  const rightCenter = shape.getRightCenter();
  const handles = [
    {
      position: Corner.TOP_LEFT,
      x: topLeft.x,
      y: topLeft.y,
      width: HANDLE_SIZE,
      height: HANDLE_SIZE,
    },
    {
      position: Corner.TOP_RIGHT,
      x: topRight.x,
      y: topRight.y,
      width: HANDLE_SIZE,
      height: HANDLE_SIZE,
    },
    {
      position: Corner.BOTTOM_RIGHT,
      x: bottomRight.x,
      y: bottomRight.y,
      width: HANDLE_SIZE,
      height: HANDLE_SIZE,
    },
    {
      position: Corner.BOTTOM_LEFT,
      x: bottomLeft.x,
      y: bottomLeft.y,
      width: HANDLE_SIZE,
      height: HANDLE_SIZE,
    },
    {
      position: Edge.TOP,
      x: topCenter.x,
      y: topCenter.y,
      width: HANDLE_SIZE,
      height: HANDLE_SIZE,
    },
    {
      position: Edge.RIGHT,
      x: rightCenter.x,
      y: rightCenter.y,
      width: HANDLE_SIZE,
      height: HANDLE_SIZE,
    },
    {
      position: Edge.BOTTOM,
      x: bottomCenter.x,
      y: bottomCenter.y,
      width: HANDLE_SIZE,
      height: HANDLE_SIZE,
    },
    {
      position: Edge.LEFT,
      x: leftCenter.x,
      y: leftCenter.y,
      width: HANDLE_SIZE,
      height: HANDLE_SIZE,
    },
  ];

  return handles;
}

function getResizedPoints(
  staticCornerPoint,
  expectedCornerPoint,
  rotation,
  fixedDimension = {},
) {
  const newCenter = {
    x: (staticCornerPoint.x + expectedCornerPoint.x) / 2,
    y: (staticCornerPoint.y + expectedCornerPoint.y) / 2,
  };

  const newStaticCornerPoint = Phaser.Math.RotateAround(
    staticCornerPoint,
    newCenter.x,
    newCenter.y,
    -rotation,
  );

  const newExpectedCornerPointAfterResize = Phaser.Math.RotateAround(
    expectedCornerPoint,
    newCenter.x,
    newCenter.y,
    -rotation,
  );

  let newWidth = Math.abs(
    newExpectedCornerPointAfterResize.x - newStaticCornerPoint.x,
  );

  let newHeight = Math.abs(
    newExpectedCornerPointAfterResize.y - newStaticCornerPoint.y,
  );

  if (fixedDimension.width) {
    newWidth = fixedDimension.width;
  }

  if (fixedDimension.height) {
    newHeight = fixedDimension.height;
  }

  return {
    x: newCenter.x,
    y: newCenter.y,
    width: newWidth,
    height: newHeight,
  };
}

export { getResizedPoints, Corner, Edge, constructHandles };
