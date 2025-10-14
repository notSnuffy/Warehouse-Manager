import Phaser from "phaser";
import * as Shapes from "@shapes";

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
 * Returns a wrapper container for the given shapes
 * @param {Array} shapes - The shapes to wrap
 * @return {Object} A container object that wraps the shapes
 */
function getContainerWrapper(shapes) {
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
    positionX: boundingBox.centerX,
    positionY: boundingBox.centerY,
    width: boundingBox.width,
    height: boundingBox.height,
    rotation: 0,
    components: [],
  };

  return rootContainer;
}

const ShapeCommands = Object.freeze({
  CREATE_RECTANGLE: "CREATE_RECTANGLE",
  CREATE_ELLIPSE: "CREATE_ELLIPSE",
  CREATE_ARC: "CREATE_ARC",
  CREATE_POLYGON: "CREATE_POLYGON",
  BEGIN_CONTAINER: "BEGIN_CONTAINER",
  END_CONTAINER: "END_CONTAINER",
});

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

/**
 * Preprocesses shapes for instruction saving
 * @param {Array} shapes - The shapes to preprocess
 * @return {Array} An array of preprocessed shapes
 */
function preprocessShapesForSaving(shapes) {
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
  const preprocessedShapes = shapes.map((shape) => {
    let shapeId = getShapeId(shape);
    const shapeVersion = shape.version || null;

    console.log(shapes);
    console.log(shape.x);
    let shapeComponent = {
      shapeId: shapeId,
      shapeVersion: shapeVersion,
      positionX: shape.x,
      positionY: shape.y,
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

        const childWidth = Phaser.Math.Distance.BetweenPoints(
          child.getLeftCenter(undefined, true),
          child.getRightCenter(undefined, true),
        );
        const childHeight = Phaser.Math.Distance.BetweenPoints(
          child.getTopCenter(undefined, true),
          child.getBottomCenter(undefined, true),
        );

        const parentWorldMatrix = parent.getWorldTransformMatrix();
        const childWorldMatrix = child.getWorldTransformMatrix();

        const dx = childWorldMatrix.tx - parentWorldMatrix.tx;
        const dy = childWorldMatrix.ty - parentWorldMatrix.ty;

        const rotation = parentWorldMatrix.rotationNormalized;

        const rotatedX = dx * Math.cos(-rotation) - dy * Math.sin(-rotation);
        const rotatedY = dx * Math.sin(-rotation) + dy * Math.cos(-rotation);

        let childComponent = {
          shapeId: childShapeId,
          shapeVersion: child.version || null,
          positionX: rotatedX,
          positionY: rotatedY,
          width: childWidth,
          height: childHeight,
          rotation: child.rotation,
          arcStartAngle: child.startAngle || null,
          arcEndAngle: child.endAngle || null,
          arcRadius: child.radius || null,
          polygonPoints:
            childShapeId === ShapeTypes.POLYGON ? child.pathData : null,
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
  console.log("Preprocessed Shapes:", preprocessedShapes);
  return preprocessedShapes;
}

/**
 * Gets shapes wrapped in a container
 * @param {Array} shapes - Shapes in the editor
 * @return {Object} The root container with wrapped shapes
 */
function getShapesWrappedInContainer(shapes) {
  const convertShapeCoordinatesToContainer = (shape, container) => {
    const adjustedX = shape.positionX - container.positionX;
    const adjustedY = shape.positionY - container.positionY;

    return {
      x: adjustedX,
      y: adjustedY,
    };
  };

  const rootContainer = getContainerWrapper(shapes);
  console.log("Root Container:", rootContainer);
  const shapeComponents = preprocessShapesForSaving(shapes);
  console.log("Shape Components:", shapeComponents);
  shapeComponents.forEach((shape) => {
    const adjustedCoordinates = convertShapeCoordinatesToContainer(
      shape,
      rootContainer,
    );
    console.log(
      `Adjusted Coordinates for Shape ID ${shape.shapeId}: ${adjustedCoordinates.x}, ${adjustedCoordinates.y}`,
    );
    shape.positionX = adjustedCoordinates.x;
    shape.positionY = adjustedCoordinates.y;
    return shape;
  });

  rootContainer.components = shapeComponents;
  return rootContainer;
}

/**
 * Saves the shape as a set of instructions to execute to recreate it
 * @param {Object} shape - The shape to save
 * @return {string} An array of instructions in JSON format
 */
function saveShapeAsInstructions(shape) {
  const instructions = [];

  const getShapeCommandName = (shapeId) => {
    switch (shapeId) {
      case ShapeTypes.RECTANGLE:
        return ShapeCommands.CREATE_RECTANGLE;
      case ShapeTypes.ELLIPSE:
        return ShapeCommands.CREATE_ELLIPSE;
      case ShapeTypes.ARC:
        return ShapeCommands.CREATE_ARC;
      case ShapeTypes.POLYGON:
        return ShapeCommands.CREATE_POLYGON;
      default:
        return ShapeCommands.BEGIN_CONTAINER;
    }
  };

  const convertShapeToInstruction = (shape) => {
    console.log("Converting shape:", shape);
    const commandName = getShapeCommandName(shape.shapeId);
    const instruction = {
      command: commandName,
      parameters: {
        shapeId: shape.shapeId,
        shapeVersion: shape.shapeVersion,
        positionX: shape.positionX,
        positionY: shape.positionY,
        width: shape.width,
        height: shape.height,
        rotation: shape.rotation,
      },
    };

    if (shape.shapeId === ShapeTypes.ARC) {
      instruction.parameters.arcStartAngle = shape.arcStartAngle;
      instruction.parameters.arcEndAngle = shape.arcEndAngle;
      instruction.parameters.arcRadius = shape.arcRadius;
    }

    if (shape.shapeId === ShapeTypes.POLYGON) {
      instruction.parameters.polygonPoints = shape.polygonPoints;
    }

    instructions.push(instruction);

    if (shape.components && shape.components.length > 0) {
      shape.components.forEach((childShape) => {
        convertShapeToInstruction(childShape);
      });

      instructions.push({
        command: ShapeCommands.END_CONTAINER,
      });
    }

    return instruction;
  };
  convertShapeToInstruction(shape);
  return instructions;
}

/**
 * Builds a shape from a set of instructions
 * @param {Array} instructions - The instructions to build the shape from
 * @param {Phaser.Scene} scene - The scene to which the shape belongs
 * @param {number} [color=0xffffff] - The color of the shape
 * @return {Array} An array of shape instances created from the instructions
 */
function buildShapeFromInstructions(instructions, scene, color = 0xffffff) {
  const containerStack = [];
  const shapes = [];

  instructions.forEach((instruction) => {
    const commandName = instruction.command;
    const parameters = instruction.parameters;

    switch (commandName) {
      case ShapeCommands.CREATE_RECTANGLE: {
        const rectangle = new Shapes.Rectangle(
          scene,
          parameters.positionX,
          parameters.positionY,
          parameters.width,
          parameters.height,
          color,
        );
        rectangle.setRotation(parameters.rotation);
        if (containerStack.length > 0) {
          const parentContainer = containerStack[containerStack.length - 1];
          parentContainer.add(rectangle);
        } else {
          shapes.push(rectangle);
        }
        break;
      }
      case ShapeCommands.CREATE_ELLIPSE: {
        const ellipse = new Shapes.Ellipse(
          scene,
          parameters.positionX,
          parameters.positionY,
          parameters.width,
          parameters.height,
          color,
        );
        ellipse.setRotation(parameters.rotation);
        if (containerStack.length > 0) {
          const parentContainer = containerStack[containerStack.length - 1];
          parentContainer.add(ellipse);
        } else {
          shapes.push(ellipse);
        }
        break;
      }
      case ShapeCommands.CREATE_ARC: {
        const arc = new Shapes.Arc(
          scene,
          parameters.positionX,
          parameters.positionY,
          parameters.arcRadius,
          parameters.arcStartAngle,
          parameters.arcEndAngle,
          false,
          color,
        );
        arc.setDisplaySize(parameters.width, parameters.height);
        arc.setRotation(parameters.rotation);
        if (containerStack.length > 0) {
          const parentContainer = containerStack[containerStack.length - 1];
          parentContainer.add(arc);
        } else {
          shapes.push(arc);
        }
        break;
      }
      case ShapeCommands.CREATE_POLYGON: {
        // Phaser always automatically adds 0, 0 to the polygon points resulting in uncessary growing of the points upon saves.
        // const polygonPointsWithRemovedLastPoint =
        //   parameters.polygonPoints.slice(0, -2);
        const polygon = new Shapes.Polygon(
          scene,
          parameters.positionX,
          parameters.positionY,
          //polygonPointsWithRemovedLastPoint,
          parameters.polygonPoints,
          color,
        );
        polygon.setDisplaySize(parameters.width, parameters.height);
        polygon.setRotation(parameters.rotation);
        if (containerStack.length > 0) {
          const parentContainer = containerStack[containerStack.length - 1];
          parentContainer.add(polygon);
          parentContainer.update();
        } else {
          shapes.push(polygon);
        }
        break;
      }
      case ShapeCommands.BEGIN_CONTAINER: {
        const container = new Shapes.Container(
          scene,
          parameters.positionX,
          parameters.positionY,
        );
        container.setSize(parameters.width, parameters.height);
        container.setRotation(parameters.rotation);
        container.id = parameters.shapeId;
        container.version = parameters.shapeVersion;

        if (containerStack.length > 0) {
          const parentContainer = containerStack[containerStack.length - 1];
          parentContainer.add(container);
        } else {
          shapes.push(container);
        }
        containerStack.push(container);

        break;
      }
      case ShapeCommands.END_CONTAINER: {
        if (containerStack.length > 0) {
          containerStack.pop();
        } else {
          console.warn("No container to end, ignoring END_CONTAINER command.");
        }
        break;
      }
    }
  });
  return shapes;
}

export {
  getShapePoints,
  getShapesWrappedInContainer,
  saveShapeAsInstructions,
  buildShapeFromInstructions,
  preprocessShapesForSaving,
  ShapeTypes,
  getRealDimensions,
  getRealPosition,
  DefaultShapeInteractiveConfig,
  calculateBoundingBox,
  createContainerSnapshotFromShapes,
};
