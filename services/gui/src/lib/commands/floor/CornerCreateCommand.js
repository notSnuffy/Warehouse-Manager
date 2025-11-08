import BaseCommand from "@commands/BaseCommand";

/**
 * CornerCreateCommand class
 * This command creates a corner in a graph structure.
 * It also supports undoing the creation by removing the corner.
 */
class CornerCreateCommand extends BaseCommand {
  /**
   * @type {AddShapeCommand}
   * The command that was used to create the corner.
   */
  #createdCommand;

  /**
   * @type {Map<Phaser.GameObjects.Arc, Map<Phaser.GameObjects.Arc, Phaser.GameObjects.Line>>}
   * The graph structure representing corners and their connections.
   */
  #graph;

  /**
   * @type {Phaser.GameObjects.Arc}
   * The corner being created.
   */
  #corner;

  /**
   * Creates an instance of CornerCreateCommand.
   * @param {AddShapeCommand} createdCommand - The command that created the corner.
   * @param {Map<Phaser.GameObjects.Arc, Map<Phaser.GameObjects.Arc, Phaser.GameObjects.Line>>} graph - The graph structure.
   * @param {Phaser.GameObjects.Arc} corner - The corner being created.
   */
  constructor(createdCommand, graph, corner) {
    super();
    this.#createdCommand = createdCommand;
    this.#graph = graph;
    this.#corner = corner;
  }

  /**
   * Executes the corner creation command.
   * @returns {Promise<void>}
   * @override
   */
  async execute() {
    await this.#createdCommand.execute();
    if (!this.#graph.has(this.#corner)) {
      this.#graph.set(this.#corner, new Map());
    }
  }

  /**
   * Undoes the corner creation command.
   * @return {Promise<void>}
   * @override
   */
  async undo() {
    await this.#createdCommand.undo();
    this.#graph.delete(this.#corner);
  }
}

export default CornerCreateCommand;
