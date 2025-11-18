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

const DefaultShapeInteractiveConfig = {
  RECTANGLE: { draggable: true },
  ELLIPSE: {
    draggable: true,
    hitArea: (shape) => shape.geom,
    hitAreaCallback: Phaser.Geom.Ellipse.Contains,
  },
  ARC: {
    draggable: true,
    hitArea: (shape) => new Phaser.Geom.Polygon(shape.pathData),
    hitAreaCallback: Phaser.Geom.Polygon.Contains,
  },
  POLYGON: {
    draggable: true,
    hitArea: (shape) => shape.geom,
    hitAreaCallback: Phaser.Geom.Polygon.Contains,
  },
  CONTAINER: { draggable: true },
  CUSTOM: { draggable: true },
};

/**
 * Calculates the bounding box for a set of items
 * @param {Array} items - The items to calculate the bounding box for
 * @param {Function} [getPoints] - A function that takes an item and returns an array of points (objects with x and y properties)
 * @returns {Object|null} An object representing the bounding box, or null if no items are provided
 */
function calculateBoundingBox(
  items,
  getPoints = (item) => [{ x: item.x, y: item.y }],
) {
  if (!items || items.length === 0) {
    return null;
  }

  let mostLeft = Infinity;
  let mostRight = -Infinity;
  let mostTop = Infinity;
  let mostBottom = -Infinity;

  items.forEach((item) => {
    const points = getPoints(item);
    points.forEach((point) => {
      mostLeft = Math.min(mostLeft, point.x);
      mostRight = Math.max(mostRight, point.x);
      mostTop = Math.min(mostTop, point.y);
      mostBottom = Math.max(mostBottom, point.y);
    });
  });

  return {
    left: mostLeft,
    right: mostRight,
    top: mostTop,
    bottom: mostBottom,
    width: mostRight - mostLeft,
    height: mostBottom - mostTop,
    centerX: (mostLeft + mostRight) / 2,
    centerY: (mostTop + mostBottom) / 2,
  };
}

/**
 * Creates a container snapshot wrapping the given shapes
 * @param {Array} shapes - The shapes to wrap
 * @returns {Object|null} A snapshot object representing the container, or null if no shapes are provided
 * @throws {Error} If any shape does not have a createSnapshot method
 */
function createContainerSnapshotFromShapes(shapes) {
  if (!shapes || shapes.length === 0) {
    return null;
  }

  const boundingBox = calculateBoundingBox(shapes, (shape) => {
    const points = Object.values(getShapePoints(shape));
    return points;
  });

  if (!boundingBox) {
    return null;
  }

  const childrenSnapshots = shapes.map((shape) => shape.createSnapshot());
  const childrenRelativeToContainer = childrenSnapshots.map((snapshot) => {
    const relativeX = snapshot.transform.x - boundingBox.centerX;
    const relativeY = snapshot.transform.y - boundingBox.centerY;
    return {
      ...snapshot,
      transform: {
        ...snapshot.transform,
        x: relativeX,
        y: relativeY,
      },
    };
  });

  return {
    transform: {
      x: boundingBox.centerX,
      y: boundingBox.centerY,
      width: boundingBox.width,
      height: boundingBox.height,
      rotation: 0,
    },
    metadata: {
      type: "container",
    },
    children: childrenRelativeToContainer,
  };
}

/**
 * Gets the real dimensions of a shape considering its transformations
 * @param {Phaser.GameObjects.Shape} shape - The shape to get dimensions from
 * @return {Object} An object containing the real width and height of the shape
 */
function getRealDimensions(shape) {
  const width = Phaser.Math.Distance.BetweenPoints(
    shape.getLeftCenter(undefined, true),
    shape.getRightCenter(undefined, true),
  );
  const height = Phaser.Math.Distance.BetweenPoints(
    shape.getTopCenter(undefined, true),
    shape.getBottomCenter(undefined, true),
  );
  return { width, height };
}

/**
 * Gets the real position of a child shape relative to its parent
 * @param {Phaser.GameObjects.Shape} child - The child shape
 * @param {Phaser.GameObjects.Container} parent - The parent container
 * @return {Object} An object containing the real x and y position of the child shape
 * relative to its parent
 */
function getRealPosition(child, parent) {
  const parentWorldMatrix = parent.getWorldTransformMatrix();
  const childWorldMatrix = child.getWorldTransformMatrix();

  const dx = childWorldMatrix.tx - parentWorldMatrix.tx;
  const dy = childWorldMatrix.ty - parentWorldMatrix.ty;

  const rotation = parentWorldMatrix.rotationNormalized;

  const rotatedX = dx * Math.cos(-rotation) - dy * Math.sin(-rotation);
  const rotatedY = dx * Math.sin(-rotation) + dy * Math.cos(-rotation);
  return { x: rotatedX, y: rotatedY };
}

export {
  getShapePoints,
  ShapeTypes,
  getRealDimensions,
  getRealPosition,
  DefaultShapeInteractiveConfig,
  calculateBoundingBox,
  createContainerSnapshotFromShapes,
};
