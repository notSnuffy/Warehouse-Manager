import Phaser from "phaser";
import { API_URL } from "@/config";
import PanningManager from "@managers/PanningManager";
import ZoomManager from "@managers/ZoomManager";
import MoveManager from "@managers/move/MoveManager";
import OutlineManager from "@managers/outlines/OutlineManager";
import SelectShapeManager from "@managers/select/SelectShapeManager";
import ShapeManager from "@managers/ShapeManager";
import ShapeEditorUIInitializer from "@lib/ShapeEditorUIInitializer";
import * as Shapes from "@shapes";
import {
  getShapePoints,
  calculateBoundingBox,
  DefaultShapeInteractiveConfig,
} from "@utils/shapes";
import ShapeModalUserInterface from "@ui/ShapeModalUserInterface";
import ShapeInstructionsHandler from "@instructions/ShapeInstructionsHandler";
import InstructionCommands from "@instructions/InstructionCommands";
import SortedLinkedMapList from "@collections/SortedLinkedMapList";

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
   * Current tool selected
   * @type {string}
   * @default "move"
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
   */
  #moveManager = null;

  /**
   * Select manager
   * Also handles rotation and resizing from resize:ResizeManager and rotation:RotationManager
   * @type {SelectShapeManager}
   * @default null
   */
  #selectManager = null;

  /**
   * Panning manager
   * @type {PanningManager}
   * @default null
   */
  #panningManager = null;

  /**
   * Shape manager
   * @type {ShapeManager}
   * @default null
   */
  #shapeManager = null;

  /**
   * Instruction handler
   * @type {ShapeInstructionsHandler}
   * @default null
   */
  #instructionHandler = null;

  /**
   * Shape modal UI
   * @type {ShapeModalUserInterface}
   * @default null
   */
  #shapeModalUI = null;

  /**
   * Loads a shape by its ID
   * @param {string} shapeId - The ID of the shape to load
   * @return {Promise<Array>} The instructions of the loaded shape
   * @async
   */
  async #loadShape(shapeId) {
    try {
      const shapeInstance = await fetch(
        API_URL + "/shape-management/shapes/" + shapeId + "/template/latest",
      );
      const shapeData = await shapeInstance.json();
      if (!shapeInstance.ok) {
        if (shapeData.errors && shapeData.errors.length > 0) {
          alert(shapeData.errors.join("\n"));
        }
        console.error("Failed to load shape:", shapeData);
        return;
      }

      const shapeNameElement = document.getElementById("shapeName");
      shapeNameElement.value = shapeData.shape.name;
      const currentShapeIdElement = document.getElementById("currentShapeId");
      currentShapeIdElement.value = shapeId;

      const instructions = shapeData.instructions;
      console.log("Shape data loaded:", shapeData);
      // Saves the world position of the shape wrapper container
      const worldPositionX = instructions[0].parameters.positionX;
      const worldPositionY = instructions[0].parameters.positionY;
      instructions.shift();
      instructions.pop();
      console.log(instructions);
      // Adjusts the position of the shapes based on the world position
      const containerStack = [];
      instructions.forEach((instruction) => {
        console.log(instruction);
        if (
          containerStack.length === 0 &&
          instruction.command !== InstructionCommands.END_CONTAINER
        ) {
          instruction.parameters.positionX += worldPositionX;
          instruction.parameters.positionY += worldPositionY;
        }

        if (instruction.command === InstructionCommands.BEGIN_CONTAINER) {
          containerStack.push(instruction);
        }
        if (instruction.command === InstructionCommands.END_CONTAINER) {
          containerStack.pop();
        }
      });

      return instructions;
    } catch (error) {
      console.error("Error fetching shape data:", error);
    }
  }

  /**
   * Constructor for the Editor scene
   * @constructor
   */
  constructor() {
    super("ShapeEditor");
  }

  /**
   * Initializes the scene
   * @public
   */
  init() {}

  /**
   * Creates the scene
   * @public
   */
  async create() {
    this.#shapeManager = new ShapeManager(this);
    this.#instructionHandler = new ShapeInstructionsHandler(this.#shapeManager);
    this.#selectManager = new SelectShapeManager(this);
    this.#moveManager = new MoveManager(this, new OutlineManager(this));
    this.#panningManager = new PanningManager(this);

    this.#panningManager.create();

    const zoomManager = new ZoomManager(this);
    zoomManager.create();

    this.#shapeManager.registerShape(
      "rectangle",
      (scene, params) => {
        const rectangle = new Shapes.Rectangle(
          scene,
          params.x,
          params.y,
          params.width,
          params.height,
          params.color,
        );
        rectangle.setRotation(params.rotation);
        return rectangle;
      },
      { command: InstructionCommands.CREATE_RECTANGLE },
    );
    this.#shapeManager.registerShape(
      "ellipse",
      (scene, params) => {
        const ellipse = new Shapes.Ellipse(
          scene,
          params.x,
          params.y,
          params.width,
          params.height,
          params.color,
        );
        ellipse.setRotation(params.rotation);
        return ellipse;
      },
      { command: InstructionCommands.CREATE_ELLIPSE },
    );
    this.#shapeManager.registerShape(
      "arc",
      (scene, params) => {
        const arc = new Shapes.Arc(
          scene,
          params.x,
          params.y,
          params.radius,
          params.startAngle,
          params.endAngle,
          false,
          params.color,
        );
        arc.setRotation(params.rotation);
        if (params.width && params.height) {
          arc.setDisplaySize(params.width, params.height);
        }
        return arc;
      },
      {
        command: InstructionCommands.CREATE_ARC,
        fieldMap: {
          radius: "arcRadius",
          startAngle: "arcStartAngle",
          endAngle: "arcEndAngle",
        },
      },
    );
    this.#shapeManager.registerShape(
      "polygon",
      (scene, params) => {
        const polygon = new Shapes.Polygon(
          scene,
          params.x,
          params.y,
          params.points,
          params.color,
        );
        polygon.setRotation(params.rotation);
        if (params.width && params.height) {
          polygon.setDisplaySize(params.width, params.height);
        }
        return polygon;
      },
      {
        command: InstructionCommands.CREATE_POLYGON,
        fieldMap: { points: "polygonPoints" },
      },
    );
    this.#shapeManager.registerShape(
      "container",
      async (scene, params) => {
        const children = [];
        if (params.children && params.children.length > 0) {
          for (const childSnapshot of params.children) {
            const childShape =
              await this.#shapeManager.addShapeFromSnapshot(childSnapshot);

            if (!childShape) {
              continue;
            }
            children.push(childShape);
          }
        }

        const container = new Shapes.Container(
          scene,
          params.x,
          params.y,
          children,
        );
        container.setRotation(params.rotation);
        container.setSize(params.width, params.height);
        return container;
      },
      { command: InstructionCommands.BEGIN_CONTAINER, priority: 1 },
    );
    this.#shapeManager.registerShape(
      "custom",
      async (_scene, params) => {
        try {
          const response = await fetch(
            API_URL +
              "/shape-management/shapes/" +
              params.templateId +
              "/template/latest",
          );

          const shapeData = await response.json();
          if (!response.ok) {
            if (shapeData.errors && shapeData.errors.length > 0) {
              alert(shapeData.errors.join("\n"));
            }
            console.error("Failed to load shape template:", shapeData);
            return;
          }

          const instructions = shapeData.instructions;
          console.log("Shape template data loaded:", shapeData);

          // Build from instructions returns array to make it more generic
          // but we only expect one shape to be returned
          const [reconstructedShapeSnapshot] =
            await this.#instructionHandler.convertFromInstructions(
              instructions,
              params.color,
            );
          const reconstructedShape =
            await this.#shapeManager.addShapeFromSnapshot(
              reconstructedShapeSnapshot,
            );

          reconstructedShape.metadata = {};
          reconstructedShape.metadata.id = params.templateId;
          reconstructedShape.metadata.version = shapeData.shape.version;
          reconstructedShape.setPosition(params.x, params.y);
          reconstructedShape.setDisplaySize(params.width, params.height);
          reconstructedShape.setRotation(params.rotation);
          return reconstructedShape;
        } catch (error) {
          console.error("Error fetching shape template:", error);
        }
      },
      { command: InstructionCommands.BEGIN_CONTAINER },
    );

    const urlParams = new URLSearchParams(window.location.search);
    const shapeId = urlParams.get("shapeId");
    if (shapeId) {
      const loadedInstructions = await this.#loadShape(shapeId);
      if (loadedInstructions && loadedInstructions.length > 0) {
        const shapesSnapshots =
          await this.#instructionHandler.convertFromInstructions(
            loadedInstructions,
            0xffffff,
          );
        const configureInteractive = (snapshots) => {
          snapshots.forEach(async (snapshot) => {
            const type = snapshot.metadata.type;

            const interactiveConfig = DefaultShapeInteractiveConfig[
              type.toUpperCase()
            ] || {
              draggable: true,
            };

            snapshot.additionalData = {
              interactive: interactiveConfig,
            };
            //if (snapshot.children && snapshot.children.length > 0) {
            //  configureInteractive(snapshot.children);
            //}
          });
        };
        configureInteractive(shapesSnapshots);
        for (const shapeSnapshot of shapesSnapshots) {
          const shape =
            await this.#shapeManager.addShapeFromSnapshot(shapeSnapshot);
          this.events.emit("shapeAdded", shape);
          this.#moveManager.create(shape);
          this.#selectManager.create(shape);
          //const addManagersToChildren = (parent) => {
          //  if (parent.list && parent.list.length > 0) {
          //    parent.list.forEach((child) => {
          //      this.#moveManager.create(child);
          //      this.#selectManager.create(child);
          //      addManagersToChildren(child);
          //    });
          //  }
          //};
          //addManagersToChildren(shape);
        }
      }
    }

    const camera = this.cameras.main;

    const scrollXElement = document.getElementById("scrollX");
    const scrollYElement = document.getElementById("scrollY");

    const cameraWidth = camera.width;
    const cameraHeight = camera.height;

    const initialWorldWidth = cameraWidth * 3;
    const initialWorldHeight = cameraHeight * 3;

    scrollXElement.max = initialWorldWidth - cameraWidth;
    scrollYElement.max = initialWorldHeight - cameraHeight;

    scrollXElement.value = cameraWidth;
    scrollYElement.value = cameraHeight;

    camera.setBounds(
      -cameraWidth,
      -cameraHeight,
      initialWorldWidth,
      initialWorldHeight,
    );

    scrollXElement.addEventListener("input", (event) => {
      const value = parseInt(event.target.value, 10);
      camera.centerOnX(
        camera.getBounds().left + value + camera.displayWidth / 2,
      );
    });
    scrollYElement.addEventListener("input", (event) => {
      const value = parseInt(event.target.value, 10);
      camera.centerOnY(
        camera.getBounds().top + value + camera.displayHeight / 2,
      );
    });

    this.minXSortedList = new SortedLinkedMapList();
    this.minYSortedList = new SortedLinkedMapList();
    this.maxXSortedList = new SortedLinkedMapList((a, b) => b - a);
    this.maxYSortedList = new SortedLinkedMapList((a, b) => b - a);

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

    this.#shapeModalUI = new ShapeModalUserInterface(
      this.#shapeManager,
      "newShapeModal",
      [this.#moveManager, this.#selectManager],
      this,
    );

    ShapeEditorUIInitializer.initialize(
      handleMoveButtonClick,
      handleSelectButtonClick,
      () => this.#currentTool,
      //addShape,
      this.#selectManager.hide.bind(this.#selectManager),
      // () => this.#shapes,
      () => this.#shapeManager.getRootShapes(),
      this.#shapeModalUI,
      this.#instructionHandler,
    );

    // for (let i = 0; i < this.#shapes.length; i++) {
    //   //let shape = this.#shapes[i];
    //   shape.setInteractive({ draggable: true });

    //   this.#moveManager.create(shape);
    //   this.#selectManager.create(shape);
    // }

    /**
     * Adjusts the camera bounds based on the shapes' positions
     * @param {number} [extraSpace=0] - Extra space to add to the bounds
     * @param {boolean} [allowShrink=false] - Whether to allow shrinking the bounds
     * @returns {void}
     */
    const adjustCameraBounds = (extraSpace = 0, allowShrink = false) => {
      const camera = this.cameras.main;
      const oldBounds = camera.getBounds();
      // -1542, 3084 -> 4626

      let newWorldWidth = oldBounds.width;
      let newWorldHeight = oldBounds.height;
      let newLeft = oldBounds.left;
      let newTop = oldBounds.top;

      let minX = this.minXSortedList.getHeadValue() - extraSpace;
      minX = Math.min(minX, -cameraWidth);
      minX = Math.round(minX);

      const canExpandLeft = minX < oldBounds.left;
      const isShrinkingLeft = minX > oldBounds.left;
      const canShrinkLeft = isShrinkingLeft && allowShrink;

      if (canExpandLeft || canShrinkLeft) {
        newLeft = minX;
        newWorldWidth = oldBounds.right - minX;

        const pixelsOnTheRight = scrollXElement.max - scrollXElement.value;
        scrollXElement.max = newWorldWidth - camera.displayWidth;
        scrollXElement.value = scrollXElement.max - pixelsOnTheRight;
      }

      let maxX = this.maxXSortedList.getHeadValue() + extraSpace;
      maxX = Math.max(maxX, initialWorldWidth - cameraWidth);
      maxX = Math.round(maxX);
      const canExpandRight = maxX > oldBounds.right;
      const isShrinkingRight = maxX < oldBounds.right;
      const canShrinkRight = isShrinkingRight && allowShrink;

      if (canExpandRight || canShrinkRight) {
        newWorldWidth = maxX - oldBounds.left;

        scrollXElement.max = newWorldWidth - camera.displayWidth;
      }

      let minY = this.minYSortedList.getHeadValue() - extraSpace;
      minY = Math.min(minY, -cameraHeight);
      minY = Math.round(minY);

      const canExpandTop = minY < oldBounds.top;
      const isShrinkingTop = minY > oldBounds.top;
      const canShrinkTop = isShrinkingTop && allowShrink;
      if (canExpandTop || canShrinkTop) {
        newTop = minY;
        newWorldHeight = oldBounds.bottom - minY;

        const pixelsOnTheBottom = scrollYElement.max - scrollYElement.value;
        scrollYElement.max = newWorldHeight - camera.displayHeight;
        scrollYElement.value = scrollYElement.max - pixelsOnTheBottom;
      }

      let maxY = this.maxYSortedList.getHeadValue() + extraSpace;
      maxY = Math.max(maxY, initialWorldHeight - cameraHeight);
      maxY = Math.round(maxY);
      const canExpandBottom = maxY > oldBounds.bottom;
      const isShrinkingBottom = maxY < oldBounds.bottom;
      const canShrinkBottom = isShrinkingBottom && allowShrink;
      if (canExpandBottom || canShrinkBottom) {
        newWorldHeight = maxY - oldBounds.top;

        scrollYElement.max = newWorldHeight - camera.displayHeight;
      }

      camera.setBounds(newLeft, newTop, newWorldWidth, newWorldHeight);
    };

    this.events.on("shapeAdded", (shape) => {
      const boundingBox = calculateBoundingBox([shape], (shape) => {
        const points = Object.values(getShapePoints(shape));
        return points;
      });
      this.minXSortedList.insert(shape.internalId, boundingBox.left);
      this.minYSortedList.insert(shape.internalId, boundingBox.top);
      this.maxXSortedList.insert(shape.internalId, boundingBox.right);
      this.maxYSortedList.insert(shape.internalId, boundingBox.bottom);
      adjustCameraBounds();
    });
    this.events.on("shapeMoved", (shape) => {
      const boundingBox = calculateBoundingBox([shape], (shape) => {
        const points = Object.values(getShapePoints(shape));
        return points;
      });
      this.minXSortedList.update(shape.internalId, boundingBox.left);
      this.minYSortedList.update(shape.internalId, boundingBox.top);
      this.maxXSortedList.update(shape.internalId, boundingBox.right);
      this.maxYSortedList.update(shape.internalId, boundingBox.bottom);
      adjustCameraBounds();
    });
    this.events.on("shapeMoveEnd", (shape) => {
      const boundingBox = calculateBoundingBox([shape], (shape) => {
        const points = Object.values(getShapePoints(shape));
        return points;
      });
      this.minXSortedList.update(shape.internalId, boundingBox.left);
      this.minYSortedList.update(shape.internalId, boundingBox.top);
      this.maxXSortedList.update(shape.internalId, boundingBox.right);
      this.maxYSortedList.update(shape.internalId, boundingBox.bottom);
      adjustCameraBounds(0, true);
    });
    this.events.on("shapeResized", (shape) => {
      const boundingBox = calculateBoundingBox([shape], (shape) => {
        const points = Object.values(getShapePoints(shape));
        return points;
      });
      this.minXSortedList.update(shape.internalId, boundingBox.left);
      this.minYSortedList.update(shape.internalId, boundingBox.top);
      this.maxXSortedList.update(shape.internalId, boundingBox.right);
      this.maxYSortedList.update(shape.internalId, boundingBox.bottom);
      adjustCameraBounds(40);
    });
    this.events.on("shapeResizeEnd", (shape) => {
      const boundingBox = calculateBoundingBox([shape], (shape) => {
        const points = Object.values(getShapePoints(shape));
        return points;
      });
      this.minXSortedList.update(shape.internalId, boundingBox.left);
      this.minYSortedList.update(shape.internalId, boundingBox.top);
      this.maxXSortedList.update(shape.internalId, boundingBox.right);
      this.maxYSortedList.update(shape.internalId, boundingBox.bottom);
      adjustCameraBounds(0, true);
    });
    this.events.on("shapeRotated", (shape) => {
      const boundingBox = calculateBoundingBox([shape], (shape) => {
        const points = Object.values(getShapePoints(shape));
        return points;
      });
      this.minXSortedList.update(shape.internalId, boundingBox.left);
      this.minYSortedList.update(shape.internalId, boundingBox.top);
      this.maxXSortedList.update(shape.internalId, boundingBox.right);
      this.maxYSortedList.update(shape.internalId, boundingBox.bottom);
      adjustCameraBounds();
    });

    this.events.on("cameraZoomChanged", (_newZoom) => {
      scrollXElement.max = camera.getBounds().width - camera.displayWidth;
      scrollYElement.max = camera.getBounds().height - camera.displayHeight;

      scrollXElement.value =
        Math.abs(camera.getBounds().left) +
        camera.worldView.centerX -
        camera.displayWidth / 2;
      scrollYElement.value =
        Math.abs(camera.getBounds().top) +
        camera.worldView.centerY -
        camera.displayHeight / 2;
    });

    this.events.on("cameraPanned", (camera) => {
      scrollXElement.value =
        Math.abs(camera.getBounds().left) +
        camera.worldView.centerX -
        camera.displayWidth / 2;
      scrollYElement.value =
        Math.abs(camera.getBounds().top) +
        camera.worldView.centerY -
        camera.displayHeight / 2;
    });

    //this.input.on("pointerdown", () => {
    //  const shape = this.#shapeManager.getRootShapes()[0];
    //  shape.list.forEach((child) => {
    //    child.input.enabled = !child.input.enabled;
    //  });
    //});
  }

  /**
   * Updates the scene
   * @public
   */
  update() {
    if (this.#moveManager.isDragging && this.#panningManager.isPanning) {
      this.input.activePointer.updateWorldPoint(this.cameras.main);
      this.#moveManager.update(
        null,
        this.input.activePointer.worldX,
        this.input.activePointer.worldY,
      );
    }
    if (this.#selectManager.isResizing && this.#panningManager.isPanning) {
      this.input.activePointer.updateWorldPoint(this.cameras.main);
      this.#selectManager.update(
        this.input.activePointer.worldX,
        this.input.activePointer.worldY,
      );
    }
    this.#panningManager.update();
  }
}

export { ShapeEditor as ShapeEditor, DEFAULT_SHAPES };
