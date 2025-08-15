import Phaser from "phaser";
import * as Shapes from "../../shapes";

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
  RECTANGLE: -5,
  ELLIPSE: -4,
  ARC: -3,
  POLYGON: -2,
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
        console.log(
          `Child World Center Coordinates: ${childWorldCenterCoordinates.x}, ${childWorldCenterCoordinates.y}`,
        );
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
  rootContainer.components = shapeComponents;
  return rootContainer;
}

const ShapeCommands = Object.freeze({
  CREATE_RECTANGLE: "createRectangle",
  CREATE_ELLIPSE: "createEllipse",
  CREATE_ARC: "createArc",
  CREATE_POLYGON: "createPolygon",
  BEGIN_CONTAINER: "beginContainer",
  END_CONTAINER: "endContainer",
});

/**
 * Saves the shape as a set of instructions to execute to recreate it
 * @param {Object} rootContainer - The root container to save shapes from
 * @return {string} An array of instructions in JSON format
 */
function saveShapeAsInstructions(rootContainer) {
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
    const commandName = getShapeCommandName(shape.shapeId);
    const instruction = {
      command: commandName,
      parameters: {
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
  convertShapeToInstruction(rootContainer);
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
  console.log(instructions);
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
        const polygon = new Shapes.Polygon(
          scene,
          parameters.positionX,
          parameters.positionY,
          parameters.polygonPoints,
          color,
        );
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
  saveShapeInstance,
  saveShapeAsInstructions,
  buildShapeFromInstructions,
};
