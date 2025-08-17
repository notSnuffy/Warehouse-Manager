import Phaser from "phaser";
import { API_URL } from "../config";
import MoveManager from "../lib/move/MoveManager";
import SelectShapeManager from "../lib/select/SelectShapeManager";
import FurnitureEditorUIInitializer from "../lib/FurnitureEditorUIInitializer";
import * as Shapes from "../shapes";
import { buildShapeFromInstructions } from "../lib/functions/shapes";

/**
 * Represents the editor scene
 * @class
 * @extends Phaser.Scene
 */
class FurnitureEditor extends Phaser.Scene {
  /**
   * Array of shapes in the scene
   * @type {Phaser.GameObjects.Shape[]}
   * @private
   */
  #shapes = [];

  /**
   * Array of placement zones in the furniture
   * @type {Phaser.GameObjects.Shape[]}
   * @private
   */
  #zones = [];

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
    super("FurnitureEditor");
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

    const addShape = async function (shapeType, parameters) {
      console.log(shapeType, parameters);
      const isAddZone = document.getElementById("addZoneSwitch").checked;
      const shapeColor = isAddZone ? 0xeb7734 : parameters.color;
      let shape = null;
      if (shapeType === "rectangle") {
        shape = new Shapes.Rectangle(
          this,
          parameters.x,
          parameters.y,
          parameters.width,
          parameters.height,
          shapeColor,
        );
      } else if (shapeType === "ellipse") {
        shape = new Shapes.Ellipse(
          this,
          parameters.x,
          parameters.y,
          parameters.width,
          parameters.height,
          shapeColor,
        );
      } else if (shapeType === "arc") {
        shape = new Shapes.Arc(
          this,
          parameters.x,
          parameters.y,
          parameters.radius,
          0,
          parameters.angle,
          false,
          shapeColor,
        );
      } else if (shapeType === "polygon") {
        shape = new Shapes.Polygon(
          this,
          parameters.x,
          parameters.y,
          parameters.points,
          shapeColor,
        );
      } else {
        const id = parameters.id;

        try {
          const shapeInstance = await fetch(
            API_URL + "/shape-management/shapes/" + id + "/template",
          );
          const shapeData = await shapeInstance.json();
          const instructions = shapeData.instructions;

          // Build from instructions returns array to make it more generic
          // but we only expect one shape to be returned
          const rebuiltShape = buildShapeFromInstructions(
            instructions,
            this,
            shapeColor,
          )[0];

          rebuiltShape.setPosition(parameters.x, parameters.y);

          shape = rebuiltShape;
          shape.id = parseInt(id, 10);
        } catch (error) {
          console.error("Error fetching shape template:", error);
        }
      }

      if (isAddZone) {
        this.#zones.push(shape);
      } else {
        this.#shapes.push(shape);
      }

      shape.setInteractive({ draggable: true });
      this.#moveManager.create(shape);
      this.#selectManager.create(shape);
      console.log(this.#shapes);
      console.log(this.#zones);
    }.bind(this);

    this.#selectManager = new SelectShapeManager(this);
    this.#moveManager = new MoveManager(this);

    FurnitureEditorUIInitializer.initialize(
      handleMoveButtonClick,
      handleSelectButtonClick,
      addShape,
      this.#selectManager.hide.bind(this.#selectManager),
      () => this.#shapes,
      () => this.#zones,
    );

    for (let i = 0; i < this.#shapes.length; i++) {
      let shape = this.#shapes[i];
      shape.setInteractive({ draggable: true });

      this.#moveManager.create(shape);
      this.#selectManager.create(shape);
    }

    this.input.on("pointerdown", this.#selectManager.hide, this.#selectManager);
  }

  /**
   * Updates the scene
   * @public
   */
  update() {}
}

export { FurnitureEditor as FurnitureEditor };
