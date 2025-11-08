import BaseCommand from "@commands/BaseCommand";

/**
 * WallCreateCommand class
 * This command creates a wall between two corners in a graph structure.
 * It also supports undoing the creation by removing the wall.
 */

class WallCreateCommand extends BaseCommand {
  /**
   * @type {AddShapeCommand}
   * The command that was used to create the wall.
   */
  #createdCommand;

  /**
   * @type {Map<Phaser.GameObjects.Arc, Map<Phaser.GameObjects.Arc, Phaser.GameObjects.Line>>}
   * The graph structure representing corners and their connections.
   */
  #graph;

  /**
   * @type {Phaser.GameObjects.Line}
   * The wall being created.
   */
  #wall;

  /**
   * @type {Phaser.GameObjects.Arc}
   * The corner from which the wall is created.
   */
  #corner;

  /**
   * @type {Phaser.GameObjects.Arc}
   * The other corner connected to the wall being created.
   */
  #otherCorner;

  /**
   * Creates an instance of WallCreateCommand.
   * @param {AddShapeCommand} createdCommand - The command that created the wall.
   * @param {Map<Phaser.GameObjects.Arc, Map<Phaser.GameObjects.Arc, Phaser.GameObjects.Line>>} graph - The graph structure.
   * @param {Phaser.GameObjects.Line} wall - The wall being created.
   * @param {Phaser.GameObjects.Arc} corner - The corner from which the wall is created.
   * @param {Phaser.GameObjects.Arc} otherCorner - The other corner connected to the wall being created.
   */
  constructor(createdCommand, graph, wall, corner, otherCorner) {
    super();
    this.#createdCommand = createdCommand;
    this.#graph = graph;
    this.#wall = wall;
    this.#corner = corner;
    this.#otherCorner = otherCorner;
  }

  /**
   * Executes the wall creation command.
   * @returns {Promise<void>}
   * @override
   */
  async execute() {
    await this.#createdCommand.execute();
    const cornerNeighbors = this.#graph.get(this.#corner);
    if (cornerNeighbors) {
      cornerNeighbors.set(this.#otherCorner, this.#wall);
    }
    const otherCornerNeighbors = this.#graph.get(this.#otherCorner);
    if (otherCornerNeighbors) {
      otherCornerNeighbors.set(this.#corner, this.#wall);
    }
  }

  /**
   * Undoes the wall creation command.
   * @returns {Promise<void>}
   * @Override
   */
  async undo() {
    await this.#createdCommand.undo();
    const cornerNeighbors = this.#graph.get(this.#corner);
    if (cornerNeighbors) {
      cornerNeighbors.delete(this.#otherCorner);
    }
    const otherCornerNeighbors = this.#graph.get(this.#otherCorner);
    if (otherCornerNeighbors) {
      otherCornerNeighbors.delete(this.#corner);
    }
  }
}

export default WallCreateCommand;
