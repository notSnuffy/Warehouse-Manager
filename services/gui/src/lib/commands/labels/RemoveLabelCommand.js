import BaseCommand from "@commands/BaseCommand";

/**
 * RemoveLabelCommand class
 * This command removes a label from a shape in the scene.
 */
class RemoveLabelCommand extends BaseCommand {
  /**
   * The labeler to manage labels in the scene.
   * @type {ShapeLabeler}
   */
  #labler;

  /**
   * The shape whose label is to be removed.
   * @type {Phaser.GameObjects.Shape}
   */
  #shape;

  /**
   * The snapshot of the removed label for undoing the removal.
   * @type {Object|null}
   */
  #snapshot;

  /**
   * Creates an instance of RemoveLabelCommand.
   * @param {ShapeLabeler} labler - The labeler to manage labels in the scene.
   * @param {Phaser.GameObjects.Shape} shape - The shape whose label is to be removed.
   */
  constructor(labler, shape) {
    super();
    this.#labler = labler;
    this.#shape = shape;
  }

  /**
   * Executes the command to remove the label from the shape.
   * @returns {Promise<void>}
   */
  async execute() {
    const label = this.#labler.getLabel(this.#shape);
    if (!label) {
      console.warn(`Label for shape '${this.#shape}' does not exist.`);
      return;
    }
    this.#snapshot = label.createSnapshot();
    this.#labler.removeLabel(this.#shape);
  }

  /**
   * Undoes the command by restoring the removed label to the shape.
   * @returns {Promise<void>}
   */
  async undo() {
    if (!this.#snapshot) {
      console.warn("No label snapshot to restore.");
      return;
    }

    this.#labler.addLabelFromSnapshot(this.#shape, this.#snapshot);
  }
}

export default RemoveLabelCommand;
