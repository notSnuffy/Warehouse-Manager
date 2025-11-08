import BaseCommand from "@commands/BaseCommand";

/**
 * WallRemoveCommand class
 * This command removes a wall between two corners in a graph structure.
 * It also supports undoing the removal by restoring the wall.
 */
class WallRemoveCommand extends BaseCommand {
  /**
   * @type {RemoveShapeCommand}
   * The command that was used to remove the wall.
   */
  #removedCommand;

  /**
   * @type {Phaser.GameObjects.Line}
   * The wall being removed.
   */
  #wall;

  /**
   * @type {Map<Phaser.GameObjects.Arc, Map<Phaser.GameObjects.Arc, Phaser.GameObjects.Line>>}
   * The graph structure representing corners and their connections.
   */
  #graph;

  /**
   * @type {Phaser.GameObjects.Arc}
   * The corner from which the wall is being removed.
   */
  #corner;

  /**
   * @type {Phaser.GameObjects.Arc}
   * The other corner connected to the wall being removed.
   */
  #otherCorner;

  /**
   * Creates an instance of WallRemoveCommand.
   * @param {RemoveShapeCommand} removedCommand - The command that removed the wall.
   * @param {Map<Phaser.GameObjects.Arc, Map<Phaser.GameObjects.Arc, Phaser.GameObjects.Line>>} graph - The graph structure.
   * @param {Phaser.GameObjects.Line} wall - The wall being removed.
   * @param {Phaser.GameObjects.Arc} corner - The corner from which the wall is being removed.
   * @param {Phaser.GameObjects.Arc} otherCorner - The other corner connected to the wall being removed.
   */
  constructor(removedCommand, graph, wall, corner, otherCorner) {
    super();
    this.#removedCommand = removedCommand;
    this.#graph = graph;
    this.#wall = wall;
    this.#corner = corner;
    this.#otherCorner = otherCorner;
  }

  /**
   * Executes the wall removal command.
   * @returns {Promise<void>}
   * @override
   */
  async execute() {
    await this.#removedCommand.execute();
    const cornerNeighbors = this.#graph.get(this.#corner);
    if (cornerNeighbors) {
      cornerNeighbors.delete(this.#otherCorner);
    }
    const otherCornerNeighbors = this.#graph.get(this.#otherCorner);
    if (otherCornerNeighbors) {
      otherCornerNeighbors.delete(this.#corner);
    }
  }

  /**
   * Undoes the wall removal command.
   * @returns {Promise<void>}
   * @override
   */
  async undo() {
    await this.#removedCommand.undo();
    let cornerNeighbors = this.#graph.get(this.#corner);
    if (!cornerNeighbors) {
      return;
    }

    cornerNeighbors.set(this.#otherCorner, this.#wall);
    let otherCornerNeighbors = this.#graph.get(this.#otherCorner);
    if (!otherCornerNeighbors) {
      return;
    }
    otherCornerNeighbors.set(this.#corner, this.#wall);
  }
}

export default WallRemoveCommand;
