import BaseCommand from "@commands/BaseCommand";

/**
 * CornerRemoveCommand class
 * This command removes a corner from a graph structure.
 * It also supports undoing the removal by restoring the corner.
 */
class CornerRemoveCommand extends BaseCommand {
  /**
   * @type {RemoveShapeCommand}
   * The command that was used to remove the corner.
   */
  #removedCommand;

  /**
   * @type {Map<Phaser.GameObjects.Arc, Map<Phaser.GameObjects.Arc, Phaser.GameObjects.Line>>}
   * The graph structure representing corners and their connections.
   */
  #graph;

  /**
   * @type {Phaser.GameObjects.Arc}
   * The corner being removed.
   */
  #corner;

  /**
   * Creates an instance of CornerRemoveCommand.
   * @param {RemoveShapeCommand} removedCommand - The command that removed the corner.
   * @param {Map<Phaser.GameObjects.Arc, Map<Phaser.GameObjects.Arc, Phaser.GameObjects.Line>>} graph - The graph structure.
   * @param {Phaser.GameObjects.Arc} corner - The corner being removed.
   */
  constructor(removedCommand, graph, corner) {
    super();
    this.#removedCommand = removedCommand;
    this.#graph = graph;
    this.#corner = corner;
  }

  /**
   * Executes the corner removal command.
   * @returns {Promise<void>}
   * @override
   */
  async execute() {
    await this.#removedCommand.execute();
    this.#graph.delete(this.#corner);
  }

  /**
   * Undoes the corner removal command.
   * @returns {Promise<void>}
   * @override
   */
  async undo() {
    await this.#removedCommand.undo();
    if (!this.#graph.has(this.#corner)) {
      this.#graph.set(this.#corner, new Map());
    }
  }
}

export default CornerRemoveCommand;
