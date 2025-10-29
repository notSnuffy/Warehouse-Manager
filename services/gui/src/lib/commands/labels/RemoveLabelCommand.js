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
   * The ID of the shape whose label is to be removed.
   * @type {string}
   */
  #shapeId;

  /**
   * The snapshot of the removed label for undoing the removal.
   * @type {Object|null}
   */
  #snapshot;

  /**
   * Creates an instance of RemoveLabelCommand.
   * @param {ShapeLabeler} labler - The labeler to manage labels in the scene.
   * @param {string} shapeId - The ID of the shape whose label is to be removed.
   */
  constructor(labler, shapeId) {
    super();
    this.#labler = labler;
    this.#shapeId = shapeId;
  }

  /**
   * Executes the command to remove the label from the shape.
   * @returns {Promise<void>}
   */
  async execute() {
    const label = this.#labler.getLabel(this.#shapeId);
    if (!label) {
      console.warn(
        `Label for shape with ID '${this.#shapeId}' does not exist.`,
      );
      return;
    }
    this.#snapshot = label.createSnapshot();
    this.#labler.removeLabel(this.#shapeId);
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

    this.#labler.addLabelFromSnapshot(this.#shapeId, this.#snapshot);
  }
}

export default RemoveLabelCommand;
