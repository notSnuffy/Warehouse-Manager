import { API_URL } from "../config";
import Phaser from "phaser";

class FloorEditor extends Phaser.Scene {
  /**
   * Graph representing the floor layout
   * @type {Map<Phaser.GameObjects.Circle, Map<Phaser.GameObjects.Circle, Phaser.GameObjects.Line>>}
   * @private
   * @default new Map()
   */
  #graph = new Map();

  /**
   * Array to hold selected corners
   * @type {Phaser.GameObjects.Circle[]}
   * @private
   * @default []
   */
  #selectedCorners = [];

  /**
   * Indicated the currently active tool
   * @type {string}
   * @default "move"
   * @private
   */
  #activeTool = "move";

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
   * Creates a wall between two corners
   * @private
   * @param {Phaser.GameObjects.Circle} corner1 - The first corner
   * @param {Phaser.GameObjects.Circle} corner2 - The second corner
   * @return {void}
   */
  #createWall(corner1, corner2) {
    if (corner1 === corner2) {
      console.warn("Cannot create a wall between the same corner.");
      return;
    }

    if (this.#graph.get(corner1).has(corner2)) {
      console.warn("A wall already exists between these corners.");
      return;
    }

    const wall = this.add
      .line(0, 0, corner1.x, corner1.y, corner2.x, corner2.y, 0xffffff)
      .setOrigin(0, 0)
      .setLineWidth(10);

    this.#graph.get(corner1).set(corner2, wall);
    this.#graph.get(corner2).set(corner1, wall);
  }

  #updateWalls(corner) {
    const connectedCorners = this.#graph.get(corner);

    connectedCorners.forEach((wall, otherCorner) => {
      wall.setTo(corner.x, corner.y, otherCorner.x, otherCorner.y);
    });
  }

  /**
   * Adds a corner to the floor editor
   * @param {number} positionX - The x-coordinate of the corner
   * @param {number} positionY - The y-coordinate of the corner
   * @private
   * @return {Phaser.GameObjects.Circle} - The created corner object
   */
  #addCorner(positionX = 100, positionY = 100) {
    const corner = this.add
      .circle(positionX, positionY, 20, 0xffffff)
      .setInteractive({ draggable: true });

    this.#graph.set(corner, new Map());

    corner.on("drag", (_pointer, dragX, dragY) => {
      if (this.#activeTool !== "move") {
        return;
      }

      corner.setPosition(dragX, dragY);
      this.#updateWalls(corner);
    });

    corner.on("pointerdown", (_pointer, _x, _y, event) => {
      event.stopPropagation();
      if (this.#activeTool !== "select") {
        return;
      }

      if (!this.#selectedCorners.includes(corner)) {
        corner.setFillStyle(0xff0000);
        this.#selectedCorners.push(corner);
      }

      if (this.#selectedCorners.length === 2) {
        this.#createWall(this.#selectedCorners[0], this.#selectedCorners[1]);
        this.#selectedCorners.forEach((c) => c.setFillStyle(0xffffff));
        this.#selectedCorners = [];
      }
    });
    return corner;
  }

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

  async #loadFloor(floorId) {
    const floorData = await this.#loadFloorData(floorId);
    const floorNameInput = document.getElementById("floorName");
    floorNameInput.value = floorData.name;

    const cornerMap = new Map();

    floorData.corners.forEach((cornerData) => {
      const corner = this.#addCorner(
        cornerData.positionX,
        cornerData.positionY,
      );
      cornerMap.set(cornerData.id, corner);
    });

    floorData.walls.forEach((wallData) => {
      const startCorner = cornerMap.get(wallData.startCornerId);
      const endCorner = cornerMap.get(wallData.endCornerId);
      if (startCorner && endCorner) {
        // Check if the wall already exists
        if (this.#graph.get(startCorner).has(endCorner)) {
          return;
        }
        this.#createWall(startCorner, endCorner);
      } else {
        console.warn("Invalid corners for wall:", wallData);
      }
    });
  }

  /**
   * Creates the scene
   * @public
   */
  async create() {
    const urlParams = new URLSearchParams(window.location.search);
    const floorId = urlParams.get("floorId");
    if (floorId) {
      await this.#loadFloor(floorId);
    }

    const addCornerButton = document.getElementById("addCornerButton");
    addCornerButton.addEventListener("click", () => {
      this.#addCorner();
    });

    const moveButton = document.getElementById("moveButton");
    moveButton.addEventListener("click", () => {
      this.#activeTool = "move";
      this.#selectedCorners.forEach((corner) => {
        corner.setFillStyle(0xffffff);
      });
      this.#selectedCorners = [];
    });

    const selectButton = document.getElementById("selectButton");
    selectButton.addEventListener("click", () => {
      this.#activeTool = "select";
      this.#selectedCorners.forEach((corner) => {
        corner.setFillStyle(0xffffff);
      });
      this.#selectedCorners = [];
    });

    const saveButton = document.getElementById("saveButton");
    saveButton.addEventListener("click", async () => {
      const floorName = document.getElementById("floorName").value;
      if (!floorName) {
        alert("Please enter a floor name.");
        return;
      }

      let floorData = {
        name: floorName,
        corners: [],
        walls: [],
      };

      const cornersIds = new Map();

      let cornerId = 1;
      this.#graph.forEach((_neighbours, corner) => {
        floorData.corners.push({
          id: cornerId,
          positionX: corner.x,
          positionY: corner.y,
        });
        cornersIds.set(corner, cornerId);
        cornerId++;
      });
      this.#graph.forEach((neighbours, parent) => {
        neighbours.forEach((_wall, child) => {
          floorData.walls.push({
            startCornerId: cornersIds.get(parent),
            endCornerId: cornersIds.get(child),
          });
        });
      });

      console.log("Floor data to save:", floorData);

      try {
        const response = await fetch(`${API_URL}/floor-management/floors`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(floorData),
        });

        if (!response.ok) {
          throw new Error("Failed to save floor data.");
        }

        const result = await response.json();
        console.log("Floor saved successfully:", result);
      } catch (error) {
        console.error("Error saving floor data:", error);
      }
    });

    this.input.on("pointerdown", () => {
      if (this.#activeTool === "select") {
        this.#selectedCorners.forEach((corner) => {
          corner.setFillStyle(0xffffff);
        });
        this.#selectedCorners = [];
      }
    });
  }
  /**
   * Updates the scene
   * @public
   */
  update() {}
}

export { FloorEditor };
