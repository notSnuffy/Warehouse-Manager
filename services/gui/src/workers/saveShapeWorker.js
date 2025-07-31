import { getShapePoints } from "../lib/functions/shapes";
import { Phaser } from "phaser";

self.onmessage = function (e) {
  const { shapes } = e.data;
  try {
    console.log("Shape save worker started");

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
      switch (shape.type) {
        case "rectangle":
          return 1;
        case "ellipse":
          return 2;
        case "arc":
          return 3;
        case "polygon":
          return 4;
        default:
          return 0; // Default case
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
        width: shape.width,
        height: shape.height,
        rotation: shape.rotation,
        arcStartAngle: shape.arcStartAngle || null,
        arcEndAngle: shape.arcEndAngle || null,
        arcRadius: shape.arcRadius || null,
        components: [],
      };

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
          const localChildCoordinates = parent.getLocalPoint(
            childWorldCenterCoordinates.x,
            childWorldCenterCoordinates.y,
          );

          let childComponent = {
            shapeId: childShapeId,
            positionX: localChildCoordinates.x,
            positionY: localChildCoordinates.y,
            width: childWidth,
            height: childHeight,
            rotation: child.rotation,
            arcStartAngle: child.arcStartAngle || null,
            arcEndAngle: child.arcEndAngle || null,
            arcRadius: child.arcRadius || null,
            components: [],
          };
          parentComponent.components.push(childComponent);
          if (child.type === "container") {
            convertContainerChildren(child.getAll(), child, childComponent);
          }
        });
      };
      if (shape.type === "container") {
        convertContainerChildren(shape.getAll(), shape, shapeComponent);
      }
    });
    rootContainer.components = shapeComponents;

    self.postMessage({
      rootContainer: rootContainer,
    });
  } catch (error) {
    self.postMessage({
      error: error.message,
    });
  }
};
