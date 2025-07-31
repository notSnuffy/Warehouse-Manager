self.onmessage = function (e) {
  const { points, dragX, dragY, sceneWidth, sceneHeight, shapeX, shapeY } =
    e.data;

  console.log(points);
  const minX = points.reduce((acc, p) => Math.min(acc, p.x), points[0].x);
  const maxX = points.reduce((acc, p) => Math.max(acc, p.x), points[0].x);
  const minY = points.reduce((acc, p) => Math.min(acc, p.y), points[0].y);
  const maxY = points.reduce((acc, p) => Math.max(acc, p.y), points[0].y);
  console.log(minX, maxX, minY, maxY);

  const topHeightFromCenter = shapeY - minY;
  const bottomHeightFromCenter = maxY - shapeY;
  const leftWidthFromCenter = shapeX - minX;
  const rightWidthFromCenter = maxX - shapeX;
  console.log(
    topHeightFromCenter,
    bottomHeightFromCenter,
    leftWidthFromCenter,
    rightWidthFromCenter,
  );

  const leftSideWithinBounds = dragX >= leftWidthFromCenter;
  const rightSideWithinBounds = dragX + rightWidthFromCenter <= sceneWidth;
  const topSideWithinBounds = dragY >= topHeightFromCenter;
  const bottomSideWithinBounds = dragY + bottomHeightFromCenter <= sceneHeight;

  const withinBounds =
    leftSideWithinBounds &&
    rightSideWithinBounds &&
    topSideWithinBounds &&
    bottomSideWithinBounds;

  self.postMessage({ withinBounds });
};
