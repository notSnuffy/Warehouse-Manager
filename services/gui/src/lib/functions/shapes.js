import Phaser from "phaser";

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

const ShapeTypes = Object.freeze({
  RECTANGLE: 1,
  ELLIPSE: 2,
  ARC: 3,
  POLYGON: 4,
});

function saveShapeInstance(shapes) {
  let mostLeft = Infinity;
  let mostRight = -Infinity;
  let mostTop = Infinity;
  let mostBottom = -Infinity;

  shapes.forEach((shape) => {
    const points = Object.values(getShapePoints(shape));
    const minX = points.reduce((acc, p) => Math.min(acc, p.x), points[0].x);
    const maxX = points.reduce((acc, p) => Math.max(acc, p.x), points[0].x);
    const minY = points.reduce((acc, p) => Math.min(acc, p.y), points[0].y);
    const maxY = points.reduce((acc, p) => Math.max(acc, p.y), points[0].y);

    mostLeft = Math.min(mostLeft, minX);
    mostRight = Math.max(mostRight, maxX);
    mostTop = Math.min(mostTop, minY);
    mostBottom = Math.max(mostBottom, maxY);
  });

  const boundingBox = {
    left: mostLeft,
    right: mostRight,
    top: mostTop,
    bottom: mostBottom,
    width: mostRight - mostLeft,
    height: mostBottom - mostTop,
    centerX: (mostLeft + mostRight) / 2,
    centerY: (mostTop + mostBottom) / 2,
  };

  const rootContainer = {
    shapeId: -1,
    positionX: boundingBox.centerX,
    positionY: boundingBox.centerY,
    width: boundingBox.width,
    height: boundingBox.height,
    rotation: 0,
    components: [],
  };

  const getShapeId = (shape) => {
    if (shape.id) {
      return shape.id;
    }
    console.log(shape.type);
    switch (shape.type) {
      case "Rectangle":
        return ShapeTypes.RECTANGLE;
      case "Ellipse":
        return ShapeTypes.ELLIPSE;
      case "Arc":
        return ShapeTypes.ARC;
      case "Polygon":
        return ShapeTypes.POLYGON;
      default:
        return null; // Default case
    }
  };

  const convertShapeCoordinatesToContainer = (shape, container) => {
    const adjustedX = shape.x - container.positionX;
    const adjustedY = shape.y - container.positionY;

    return {
      x: adjustedX,
      y: adjustedY,
    };
  };
  console.log("Converting shapes to components...");
  const shapeComponents = shapes.map((shape) => {
    let shapeId = getShapeId(shape);
    let adjustedCoordinates = convertShapeCoordinatesToContainer(
      shape,
      rootContainer,
    );
    let shapeComponent = {
      shapeId: shapeId,
      positionX: adjustedCoordinates.x,
      positionY: adjustedCoordinates.y,
      width: shape.displayWidth,
      height: shape.displayHeight,
      rotation: shape.rotation,
      arcStartAngle: shape.startAngle || null,
      arcEndAngle: shape.endAngle || null,
      arcRadius: shape.radius || null,
      polygonPoints: shapeId === ShapeTypes.POLYGON ? shape.pathData : null,
      components: [],
    };
    console.log(shapeComponent);

    const convertContainerChildren = (children, parent, parentComponent) => {
      children.forEach((child) => {
        let childShapeId = getShapeId(child);

        const childWorldCenterCoordinates = child.getCenter(undefined, true);
        const childWidth = Phaser.Math.Distance.BetweenPoints(
          child.getLeftCenter(undefined, true),
          child.getRightCenter(undefined, true),
        );
        const childHeight = Phaser.Math.Distance.BetweenPoints(
          child.getTopCenter(undefined, true),
          child.getBottomCenter(undefined, true),
        );

        const { tx, ty } = parent.getWorldTransformMatrix();
        console.log(tx, ty);

        const dx = childWorldCenterCoordinates.x - tx;
        const dy = childWorldCenterCoordinates.y - ty;

        const rotatedLocalX =
          dx * Math.cos(-parent.rotation) - dy * Math.sin(-parent.rotation);
        const rotatedLocalY =
          dx * Math.sin(-parent.rotation) + dy * Math.cos(-parent.rotation);

        let childComponent = {
          shapeId: childShapeId,
          positionX: rotatedLocalX,
          positionY: rotatedLocalY,
          width: childWidth,
          height: childHeight,
          rotation: child.rotation,
          arcStartAngle: child.startAngle || null,
          arcEndAngle: child.endAngle || null,
          arcRadius: child.radius || null,
          polygonPoints: child.pathData || null,
          components: [],
        };
        parentComponent.components.push(childComponent);
        console.log(parentComponent);
        if (child.type === "Container") {
          convertContainerChildren(child.getAll(), child, childComponent);
        }
      });
    };
    if (shape.type === "Container") {
      convertContainerChildren(shape.getAll(), shape, shapeComponent);
    }
    return shapeComponent;
  });
  rootContainer.components = shapeComponents;
  return rootContainer;
}

export { getShapePoints, saveShapeInstance };
