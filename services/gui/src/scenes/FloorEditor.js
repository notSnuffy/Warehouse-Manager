import { API_URL } from "@/config";
import Phaser from "phaser";
import MoveManager from "@managers/move/MoveManager";
import SelectShapeManager from "@managers/select/SelectShapeManager";
import { buildShapeFromInstructions } from "@utils/shapes";
import PanningManager from "@managers/PanningManager";
import ShapeManager from "@managers/ShapeManager";
import CameraBoundsManager from "@managers/CameraBoundsManager";
import ScrollbarManager from "@managers/ScrollbarManager";
import UndoRedoManager from "@managers/UndoRedoManager";
import OutlineManager from "@managers/outlines/OutlineManager";
import ZoomManager from "@managers/ZoomManager";
import LabeledCreateCommandEventHandler from "@managers/LabeledCreateCommandEventHandler";
import ShapeInstructionsHandler from "@instructions/ShapeInstructionsHandler";
import ShapeLabeler from "@managers/ShapeLabeler";
import * as Shapes from "@shapes";
import InstructionCommands from "@instructions/InstructionCommands";
import CompositeCommand from "@commands/CompositeCommand";
import WallRemoveCommand from "@commands/floor/WallRemoveCommand";
import CornerRemoveCommand from "@commands/floor/CornerRemoveCommand";
import WallCreateCommand from "@commands/floor/WallCreateCommand";
import CornerCreateCommand from "@commands/floor/CornerCreateCommand";
import { DefaultShapeInteractiveConfig } from "@utils/shapes";
import CornerCreateCommandEventHandler from "@managers/CornerCreateCommandEventHandler";

class FloorEditor extends Phaser.Scene {
  /**
   * Graph representing the floor layout
   * @type {Map<Phaser.GameObjects.Arc, Map<Phaser.GameObjects.Arc, Phaser.GameObjects.Line>>}
   * @default new Map()
   */
  #graph = new Map();

  /**
   * Array to hold selected corners
   * @type {Phaser.GameObjects.Arc[]}
   * @default []
   */
  #selectedCorners = [];

  /**
   * Preview corner before placement
   * @type {Phaser.GameObjects.Arc|null}
   * @default null
   */
  #cornerPreview = null;

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
   * Furniture manager
   * @type {ShapeManager}
   * @default null
   */
  #furnitureManager = null;

  /**
   * Corner manager
   * @type {ShapeManager}
   * @default null
   */
  #cornerManager = null;

  /**
   * Wall manager
   * @type {ShapeManager}
   * @default null
   */
  #wallManager = null;

  /**
   * Camera bounds manager
   * @type {CameraBoundsManager}
   * @default null
   */
  #cameraBoundsManager = null;

  /**
   * Scrollbar manager
   * @type {ScrollbarManager}
   * @default null
   */
  #scrollbarManager = null;

  /**
   * Undo redo manager
   * @type {UndoRedoManager}
   * @default null
   */
  #undoRedoManager = null;

  /**
   * Furniture instructions handler
   * @type {ShapeInstructionsHandler}
   * @default null
   */
  #furnitureInstructionsHandler = null;

  /**
   * Furniture labeler
   * @type {ShapeLabeler}
   * @default null
   */
  #labeler = null;

  /**
   * Constructor for the FloorEditor scene
   * @constructor
   */
  constructor() {
    super("FloorEditor");
  }

  /**
   * Initializes the scene
   * @public
   */
  init() {}

  /**
   * Updates the walls connected to a corner
   * @param {Phaser.GameObjects.Arc} corner - The corner to update walls for
   * @return {void}
   */
  #updateWalls(corner) {
    const connectedCorners = this.#graph.get(corner);

    connectedCorners.forEach((wall, otherCorner) => {
      wall.setTo(corner.x, corner.y, otherCorner.x, otherCorner.y);
    });
  }

  /**
   * Loads the floor data from the API
   * @param {string} floorId - The ID of the floor to load
   * @returns {Promise<Object>} - The floor data
   * @throws {Error} - If the fetch fails or the response is not ok
   * @async
   */
  async #loadFloorData(floorId) {
    try {
      const response = await fetch(
        `${API_URL}/floor-management/floors/${floorId}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch floor data.");
      }
      const floorData = await response.json();
      console.log("Floor data fetched successfully:", floorData);
      return floorData;
    } catch (error) {
      console.error("Error fetching floor data:", error);
      alert("Failed to load floor data. Please check the console for details.");
    }
  }

  /**
   * Loads the floor by its ID
   * @param {string} floorId - The ID of the floor to load
   * @async
   */
  async #loadFloor(floorId) {
    const floorData = await this.#loadFloorData(floorId);
    const floorNameInput = document.getElementById("floorName");
    floorNameInput.value = floorData.name;

    const currentFloorIdElement = document.getElementById("currentFloorId");
    currentFloorIdElement.value = floorId;

    const cornerMap = new Map();

    //floorData.corners.forEach((cornerData) => {
    //const corner = this.#addCorner(
    //  cornerData.positionX,
    //  cornerData.positionY,
    //);
    //cornerMap.set(cornerData.id, corner);
    //});

    floorData.walls.forEach((wallData) => {
      const startCorner = cornerMap.get(wallData.startCornerId);
      const endCorner = cornerMap.get(wallData.endCornerId);
      if (startCorner && endCorner) {
        // Check if the wall already exists
        if (this.#graph.get(startCorner).has(endCorner)) {
          return;
        }
        //this.#createWall(startCorner, endCorner);
      } else {
        console.warn("Invalid corners for wall:", wallData);
      }
    });

    floorData.furniture.forEach((furnitureData) => {
      const furnitureInstructions =
        furnitureData.topDownViewInstance.instructions;
      const shapeId = furnitureData.topDownViewInstance.shape.id;
      const furnitureId = furnitureData.furniture.id;
      const name = furnitureData.furniture.name;

      const furniture = buildShapeFromInstructions(
        furnitureInstructions,
        this,
        0xffffff,
      )[0];

      furniture.id = shapeId;
      furniture.furnitureId = furnitureId;
      furniture.furnitureInstanceId = furnitureData.id;

      const label = this.add.text(furniture.x, furniture.y, name, {
        fontSize: "16px",
        color: "#00ff00",
      });
      label.setOrigin(0.5, 0.5);
      furniture.label = label;

      //this.#furniture.push(furniture);
      furniture.setInteractive({ draggable: true });
      this.#moveManager.create(furniture);
      this.#selectManager.create(furniture);
    });
    //console.log(this.#furniture);
  }

  /**
   * Creates the scene
   * @public
   */
  async create() {
    this.#selectManager = new SelectShapeManager(this);
    this.#moveManager = new MoveManager(this, new OutlineManager(this));
    this.#undoRedoManager = new UndoRedoManager(this, 100);
    this.#furnitureManager = new ShapeManager(this, {
      move: this.#moveManager,
      select: this.#selectManager,
    });
    this.#cornerManager = new ShapeManager(this, {
      move: this.#moveManager,
    });

    this.#wallManager = new ShapeManager(this);
    this.#labeler = new ShapeLabeler(this);

    new CornerCreateCommandEventHandler(
      this,
      this.#undoRedoManager,
      this.#cornerManager,
      this.#graph,
    );

    new LabeledCreateCommandEventHandler(
      this,
      this.#undoRedoManager,
      this.#furnitureManager,
      this.#labeler,
    );

    this.#furnitureInstructionsHandler = new ShapeInstructionsHandler(
      this.#furnitureManager,
    );
    this.#panningManager = new PanningManager(this);

    this.#panningManager.create();

    const zoomManager = new ZoomManager(this);
    zoomManager.create();

    const camera = this.cameras.main;

    const scrollXElement = document.getElementById("scrollX");
    const scrollYElement = document.getElementById("scrollY");

    const cameraWidth = camera.width;
    const cameraHeight = camera.height;

    const initialWorldWidth = cameraWidth * 3;
    const initialWorldHeight = cameraHeight * 3;

    this.#cameraBoundsManager = new CameraBoundsManager(this, camera, {
      worldWidth: initialWorldWidth,
      worldHeight: initialWorldHeight,
      eventConfig: {
        shapeAdded: { extraPadding: 0, allowShrink: false },
        shapeMoved: { extraPadding: 0, allowShrink: false },
        //shapeMoveEnd: { extraPadding: 0, allowShrink: true },
        shapeResized: { extraPadding: 40, allowShrink: false },
        //shapeResizeEnd: { extraPadding: 0, allowShrink: true },
        shapeRotated: { extraPadding: 0, allowShrink: false },
      },
    });
    this.#cameraBoundsManager.create();

    this.#scrollbarManager = new ScrollbarManager(
      this,
      camera,
      scrollXElement,
      scrollYElement,
      {
        worldWidth: initialWorldWidth,
        worldHeight: initialWorldHeight,
        eventNames: [
          "cameraZoomChanged",
          "cameraPanned",
          "cameraBoundsChanged",
        ],
      },
    );
    this.#scrollbarManager.create();

    this.#furnitureManager.registerShape(
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
      {
        command: InstructionCommands.CREATE_RECTANGLE,
      },
    );
    this.#furnitureManager.registerShape(
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
      {
        command: InstructionCommands.CREATE_ELLIPSE,
      },
    );
    this.#furnitureManager.registerShape(
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
    this.#furnitureManager.registerShape(
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
    this.#furnitureManager.registerShape(
      "container",
      async (scene, params) => {
        const children = [];
        if (params.children && params.children.length > 0) {
          for (const childSnapshot of params.children) {
            const childShape =
              await this.#furnitureManager.addShapeFromSnapshot(
                childSnapshot,
                false,
              );

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
      {
        command: InstructionCommands.BEGIN_CONTAINER,
        priority: 1,
      },
    );
    this.#furnitureManager.registerShape(
      "custom",
      async (_scene, params) => {
        try {
          const response = await fetch(
            API_URL +
              "/furniture-management/furniture/" +
              params.templateId +
              "/topDownView/template",
          );
          const templateData = await response.json();
          if (!response.ok) {
            if (templateData.errors && templateData.errors.length > 0) {
              alert(templateData.errors.join("\n"));
            }
            console.error("Failed to load shape template:", templateData);
            return;
          }

          const instructions = templateData.shape.instructions;

          // Build from instructions returns array to make it more generic
          // but we only expect one shape to be returned
          const [reconstructedTemplateSnapshot] =
            await this.#furnitureInstructionsHandler.convertFromInstructions(
              instructions,
              params.color,
            );

          const reconstructedTemplate =
            await this.#furnitureManager.addShapeFromSnapshot(
              reconstructedTemplateSnapshot,
              false,
            );

          reconstructedTemplate.setPosition(params.x, params.y);
          reconstructedTemplate.setDisplaySize(params.width, params.height);
          reconstructedTemplate.setRotation(params.rotation);

          reconstructedTemplate.metadata = {};
          reconstructedTemplate.metadata.id = templateData.shape.shape.id;
          reconstructedTemplate.metadata.furnitureId = parseInt(
            params.templateId,
            10,
          );

          return reconstructedTemplate;
        } catch (error) {
          alert(
            "Failed to load shape template. Please check the console for details.",
          );
          console.error("Error fetching shape template:", error);
        }
      },
      { command: InstructionCommands.BEGIN_CONTAINER },
    );

    this.#cornerManager.registerShape("corner", (scene, params) => {
      const corner = new Shapes.Arc(
        scene,
        params.x,
        params.y,
        20,
        0,
        360,
        false,
        0xffffff,
      );

      this.#graph.set(corner, new Map());

      //corner.setInteractive({ draggable: true });

      //corner.on("drag", (_pointer, dragX, dragY) => {
      //  corner.setPosition(dragX, dragY);
      //  this.#updateWalls(corner);
      //  this.#selectedCorners.forEach((c) => {
      //    c.setFillStyle(0xffffff);
      //  });
      //  this.#selectedCorners = [];
      //});

      corner.on("pointerdown", async (_pointer, _x, _y, event) => {
        event.stopPropagation();

        if (!this.#selectedCorners.includes(corner)) {
          corner.setFillStyle(0xff0000);
          this.#selectedCorners.push(corner);
          corner.setToTop();
        }

        if (this.#selectedCorners.length === 2) {
          //this.#createWall(this.#selectedCorners[0], this.#selectedCorners[1]);
          const params = {
            corner1: this.#selectedCorners[0],
            corner2: this.#selectedCorners[1],
          };
          const result = await this.#wallManager.addShapeWithCommand(
            "wall",
            params,
            {},
            false,
          );
          const wall = /** @type {Phaser.GameObjects.Line} */ (result.shape);
          const wallCreateCommand = new WallCreateCommand(
            result.command,
            this.#graph,
            wall,
            params.corner1,
            params.corner2,
          );
          this.#undoRedoManager.pushCommand(wallCreateCommand);

          corner.setToTop();
          this.#selectedCorners.forEach((c) => c.setFillStyle(0xffffff));
          this.#selectedCorners = [];
        }
      });
      return corner;
    });

    this.#wallManager.registerShape("wall", (scene, params) => {
      const { corner1, corner2 } = params;
      if (corner1 === corner2) {
        console.warn("Cannot create a wall between the same corner.");
        return;
      }

      if (this.#graph.get(corner1).has(corner2)) {
        console.warn("A wall already exists between these corners.");
        return;
      }

      const wall = scene.add
        .line(0, 0, corner1.x, corner1.y, corner2.x, corner2.y, 0xffffff)
        .setOrigin(0, 0)
        .setLineWidth(10);

      this.#graph.get(corner1).set(corner2, wall);
      this.#graph.get(corner2).set(corner1, wall);

      return wall;
    });

    const urlParams = new URLSearchParams(window.location.search);
    const floorId = urlParams.get("floorId");
    if (floorId) {
      await this.#loadFloor(floorId);
    }

    window.addEventListener("pointermove", (event) => {
      const canvas = this.game.canvas;
      const canvasBounds = canvas.getBoundingClientRect();

      const scaleX = this.scale.displayScale.x;
      const scaleY = this.scale.displayScale.y;

      const canvasPointer = {
        x: (event.x - canvasBounds.x) * scaleX,
        y: (event.y - canvasBounds.y) * scaleY,
      };

      const addCornerButton = document.getElementById("addCornerButton");
      if (!addCornerButton.classList.contains("active")) {
        if (this.#cornerPreview) {
          this.#cornerPreview.destroy();
          this.#cornerPreview = null;
        }
        return;
      }

      let withinWidth = true;
      if (canvasPointer.x < 0 || canvasPointer.x > this.cameras.main.width) {
        withinWidth = false;
      }
      let withinHeight = true;
      if (canvasPointer.y < 0 || canvasPointer.y > this.cameras.main.height) {
        withinHeight = false;
      }
      const worldPoint = this.cameras.main.getWorldPoint(
        canvasPointer.x,
        canvasPointer.y,
      );

      if (!this.#cornerPreview) {
        this.#cornerPreview = this.add.circle(
          worldPoint.x,
          worldPoint.y,
          20,
          0x888888,
        );
      } else {
        if (withinWidth) {
          this.#cornerPreview.x = worldPoint.x;
        }
        if (withinHeight) {
          this.#cornerPreview.y = worldPoint.y;
        }
      }
    });

    this.events.on("shapeMoved", (shape) => {
      if (!this.#graph.has(shape)) {
        return;
      }
      this.#updateWalls(shape);
    });

    this.input.on("pointerdown", async (event) => {
      this.#selectedCorners.forEach((c) => c.setFillStyle(0xffffff));
      this.#selectedCorners = [];

      const addCornerButton = document.getElementById("addCornerButton");
      if (addCornerButton.classList.contains("active")) {
        if (this.#cornerPreview) {
          this.#cornerPreview.destroy();
          this.#cornerPreview = null;
        }
        const result = await this.#cornerManager.addShapeWithCommand(
          "corner",
          {
            x: event.worldX,
            y: event.worldY,
          },
          {
            interactive: DefaultShapeInteractiveConfig.ARC,
            managers: ["move"],
          },
        );
        const corner = /** @type {Phaser.GameObjects.Arc} */ (result.shape);
        const cornerCreateCommand = new CornerCreateCommand(
          result.command,
          this.#graph,
          corner,
        );
        this.#undoRedoManager.pushCommand(cornerCreateCommand);
      }
    });

    this.input.keyboard.on("keydown-DELETE", async () => {
      if (this.#selectedCorners.length > 0) {
        const compositeCommand = new CompositeCommand();
        // This array only holds one or zero corners at a time since if there are two, a wall is created and the array is cleared
        const [corner] = this.#selectedCorners;
        const connectedCorners = this.#graph.get(corner);
        connectedCorners.forEach(async (wall, otherCorner) => {
          this.#graph.get(corner).delete(otherCorner);
          this.#graph.get(otherCorner).delete(corner);
          const { command } = await this.#wallManager.removeShapeWithCommand(
            wall,
            false,
          );
          const wallRemoveCommand = new WallRemoveCommand(
            command,
            this.#graph,
            wall,
            corner,
            otherCorner,
          );
          compositeCommand.addCommand(wallRemoveCommand);
        });
        this.#graph.delete(corner);
        const { command } =
          await this.#cornerManager.removeShapeWithCommand(corner);
        const cornerRemoveCommand = new CornerRemoveCommand(
          command,
          this.#graph,
          corner,
        );
        compositeCommand.addCommand(cornerRemoveCommand);
        this.#undoRedoManager.pushCommand(compositeCommand);
      }
    });
  }
  /**
   * Updates the scene
   * @public
   */
  update() {
    // Function that prints every ten seconds the graphs structure for debugging
    if (!this._logInterval) {
      this._logInterval = setInterval(() => {
        const now = Date.now();

        if (this._lastLogTime && now - this._lastLogTime < 10000) {
          return;
        }
        this._lastLogTime = now;
        console.log(this.#graph);
      }, 10000);
    }

    if (this.#moveManager.isDragging && this.#panningManager.isPanning) {
      this.input.activePointer.updateWorldPoint(this.cameras.main);
      this.#moveManager.update(
        null,
        this.input.activePointer.worldX,
        this.input.activePointer.worldY,
      );
      if (this.#cornerPreview) {
        this.#cornerPreview.x = this.input.activePointer.worldX;
        this.#cornerPreview.y = this.input.activePointer.worldY;
      }
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

export { FloorEditor };
