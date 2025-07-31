import Phaser from "phaser";
import MoveManager from "../lib/move/MoveManager";
import SelectShapeManager from "../lib/select/SelectShapeManager";
import ShapeEditorUIInitializer from "../lib/ShapeEditorUIInitializer";
import { getShapePoints } from "../lib/functions/shapes";
import { API_URL } from "../config";

/**
 * Default shapes
 * @type {string[]}
 * @constant
 */
const DEFAULT_SHAPES = ["rectangle", "ellipse", "arc", "polygon"];

/**
 * Represents the editor scene
 * @class
 * @extends Phaser.Scene
 */
class ShapeEditor extends Phaser.Scene {
  /**
   * Array of shapes in the scene
   * @type {Phaser.GameObjects.Shape[]}
   * @private
   */
  #shapes = [];

  /**
   * Current tool selected
   * @type {string}
   * @default "move"
   * @private
   */
  #currentTool = "move";

  /**
   * Getter for the currently active tool
   */
  get activeTool() {
    return this.#currentTool;
  }

  /**
   * Move manager
   * @type {MoveManager}
   * @default null
   * @private
   */
  #moveManager = null;

  /**
   * Select manager
   * Also handles rotation and resizing from resize:ResizeManager and rotation:RotationManager
   * @type {SelectShapeManager}
   * @default null
   * @private
   */
  #selectManager = null;

  /**
   * Constructor for the Editor scene
   * @constructor
   */
  constructor() {
    super("ShapeEditor");
    this.saveShapeWorker = new Worker(
      new URL("../workers/saveShapeWorker.js", import.meta.url),
      { type: "module" },
    );
    //this.saveShapeWorker.onmessage = (event) => {
    //  console.log("Shape save worker response received");
    //  console.log("Shape saved successfully:", event.data);
    //};
    this.saveShapeWorker.onerror = (error) => {
      console.log("❌ Worker Error:", error);
    };
    //this.saveShapeWorker.onmessageerror = (error) => {
    //  console.error("Message error in shape save worker:", error);
    //};
  }

  /**
   * Initializes the scene
   * @param {Object} data - Data passed from the previous scene
   * @public
   */
  init(data) {
    this.hello = data;
  }

  /**
   * Creates the scene
   * @public
   */
  async create() {
    /**
     * Handles the move button click event
     */
    const handleMoveButtonClick = function () {
      this.#currentTool = "move";
      this.#selectManager.hide();
    }.bind(this);

    /**
     * Handles the select button click event
     */
    const handleSelectButtonClick = function () {
      this.#currentTool = "select";
    }.bind(this);

    const addShape = function (shapeType, parameters) {
      console.log(shapeType, parameters);
      if (shapeType === "rectangle") {
        this.#shapes.push(
          this.add.rectangle(
            parameters.x,
            parameters.y,
            parameters.width,
            parameters.height,
            parameters.color,
          ),
        );
      } else if (shapeType === "ellipse") {
        this.#shapes.push(
          this.add.ellipse(
            parameters.x,
            parameters.y,
            parameters.width,
            parameters.height,
            parameters.color,
          ),
        );
      } else if (shapeType === "arc") {
        this.#shapes.push(
          this.add.arc(
            parameters.x,
            parameters.y,
            parameters.radius,
            0,
            parameters.angle,
            false,
            parameters.color,
          ),
        );
      } else if (shapeType === "polygon") {
        this.#shapes.push(
          this.add.polygon(
            parameters.x,
            parameters.y,
            parameters.points,
            parameters.color,
          ),
        );
      }

      const shape = this.#shapes[this.#shapes.length - 1];

      shape.setInteractive({ draggable: true });
      this.#moveManager.create(shape);
      this.#selectManager.create(shape);
    }.bind(this);

    const saveShape = function () {
      console.log("Saving shapes:");
      //this.saveShapeWorker.postMessage({
      //shapes: this.#shapes,
      //});
      console.log("Shape save worker started");
      const shapes = this.#shapes;

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
            return 1;
          case "Ellipse":
            return 2;
          case "Arc":
            return 3;
          case "Polygon":
            return 4;
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
          arcStartAngle: shape.arcStartAngle || null,
          arcEndAngle: shape.arcEndAngle || null,
          arcRadius: shape.arcRadius || null,
          components: [],
        };
        console.log(shapeComponent);

        const convertContainerChildren = (
          children,
          parent,
          parentComponent,
        ) => {
          children.forEach((child) => {
            let childShapeId = getShapeId(child);

            const childWorldCenterCoordinates = child.getCenter(
              undefined,
              true,
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
              arcStartAngle: child.arcStartAngle || null,
              arcEndAngle: child.arcEndAngle || null,
              arcRadius: child.arcRadius || null,
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
      console.log(rootContainer);
    }.bind(this);

    this.#selectManager = new SelectShapeManager(this);
    this.#moveManager = new MoveManager(this);

    ShapeEditorUIInitializer.initialize(
      handleMoveButtonClick,
      handleSelectButtonClick,
      addShape,
      DEFAULT_SHAPES,
      saveShape,
      this.#selectManager.hide.bind(this.#selectManager),
    );

    this.cameras.main.setBackgroundColor(0x000000);

    const container = this.add.container(300, 300);
    this.#shapes.push(container);

    container.add([
      this.add.rectangle(-100, -100, 100, 100, 0xff0000),
      this.add.rectangle(50, 50, 200, 200, 0xff0000),
      this.add.ellipse(100, -100, 100, 100, 0x00ff00),
    ]);
    const rect = container.getBounds();
    container.setSize(rect.width, rect.height);
    container.setRotation(Math.PI / 4);

    container.getTopLeft = function () {
      const { tx, ty } = this.getWorldTransformMatrix();
      const globalX = tx;
      const globalY = ty;
      const localX = -(this.displayWidth / 2);
      const localY = -(this.displayHeight / 2);
      const rotatedLocalX =
        localX * Math.cos(this.rotation) - localY * Math.sin(this.rotation);
      const rotatedLocalY =
        localX * Math.sin(this.rotation) + localY * Math.cos(this.rotation);
      const containerX = globalX + rotatedLocalX;
      const containerY = globalY + rotatedLocalY;
      return { x: containerX, y: containerY };
    };
    container.getTopRight = function () {
      const { tx, ty } = this.getWorldTransformMatrix();
      const globalX = tx;
      const globalY = ty;
      const localX = this.displayWidth / 2;
      const localY = -(this.displayHeight / 2);
      const rotatedLocalX =
        localX * Math.cos(this.rotation) - localY * Math.sin(this.rotation);
      const rotatedLocalY =
        localX * Math.sin(this.rotation) + localY * Math.cos(this.rotation);
      const containerX = globalX + rotatedLocalX;
      const containerY = globalY + rotatedLocalY;
      return { x: containerX, y: containerY };
    };
    container.getBottomLeft = function () {
      const { tx, ty } = this.getWorldTransformMatrix();
      const globalX = tx;
      const globalY = ty;
      const localX = -(this.displayWidth / 2);
      const localY = this.displayHeight / 2;
      const rotatedLocalX =
        localX * Math.cos(this.rotation) - localY * Math.sin(this.rotation);
      const rotatedLocalY =
        localX * Math.sin(this.rotation) + localY * Math.cos(this.rotation);
      const containerX = globalX + rotatedLocalX;
      const containerY = globalY + rotatedLocalY;
      return { x: containerX, y: containerY };
    };
    container.getBottomRight = function () {
      const { tx, ty } = this.getWorldTransformMatrix();
      const globalX = tx;
      const globalY = ty;
      const localX = this.displayWidth / 2;
      const localY = this.displayHeight / 2;
      const rotatedLocalX =
        localX * Math.cos(this.rotation) - localY * Math.sin(this.rotation);
      const rotatedLocalY =
        localX * Math.sin(this.rotation) + localY * Math.cos(this.rotation);
      const containerX = globalX + rotatedLocalX;
      const containerY = globalY + rotatedLocalY;
      return { x: containerX, y: containerY };
    };
    container.getLeftCenter = function () {
      const { tx, ty } = this.getWorldTransformMatrix();
      const globalX = tx;
      const globalY = ty;
      const localX = -(this.displayWidth / 2);
      const localY = 0;
      const rotatedLocalX =
        localX * Math.cos(this.rotation) - localY * Math.sin(this.rotation);
      const rotatedLocalY =
        localX * Math.sin(this.rotation) + localY * Math.cos(this.rotation);
      const containerX = globalX + rotatedLocalX;
      const containerY = globalY + rotatedLocalY;
      return { x: containerX, y: containerY };
    };
    container.getRightCenter = function () {
      const { tx, ty } = this.getWorldTransformMatrix();
      const globalX = tx;
      const globalY = ty;
      const localX = this.displayWidth / 2;
      const localY = 0;
      const rotatedLocalX =
        localX * Math.cos(this.rotation) - localY * Math.sin(this.rotation);
      const rotatedLocalY =
        localX * Math.sin(this.rotation) + localY * Math.cos(this.rotation);
      const containerX = globalX + rotatedLocalX;
      const containerY = globalY + rotatedLocalY;
      return { x: containerX, y: containerY };
    };
    container.getTopCenter = function () {
      const { tx, ty } = this.getWorldTransformMatrix();
      const globalX = tx;
      const globalY = ty;
      const localX = 0;
      const localY = -(this.displayHeight / 2);
      const rotatedLocalX =
        localX * Math.cos(this.rotation) - localY * Math.sin(this.rotation);
      const rotatedLocalY =
        localX * Math.sin(this.rotation) + localY * Math.cos(this.rotation);
      const containerX = globalX + rotatedLocalX;
      const containerY = globalY + rotatedLocalY;
      return { x: containerX, y: containerY };
    };
    container.getBottomCenter = function () {
      const { tx, ty } = this.getWorldTransformMatrix();
      const globalX = tx;
      const globalY = ty;
      const localX = 0;
      const localY = this.displayHeight / 2;
      const rotatedLocalX =
        localX * Math.cos(this.rotation) - localY * Math.sin(this.rotation);
      const rotatedLocalY =
        localX * Math.sin(this.rotation) + localY * Math.cos(this.rotation);
      const containerX = globalX + rotatedLocalX;
      const containerY = globalY + rotatedLocalY;
      return { x: containerX, y: containerY };
    };

    for (let i = 0; i < this.#shapes.length; i++) {
      let shape = this.#shapes[i];
      shape.setInteractive({ draggable: true });

      this.#moveManager.create(shape);
      this.#selectManager.create(shape);
    }

    this.input.on("pointerdown", this.#selectManager.hide, this.#selectManager);

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const _data = await response.json();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Updates the scene
   * @public
   */
  update() {}
}

export { ShapeEditor as ShapeEditor, DEFAULT_SHAPES };
