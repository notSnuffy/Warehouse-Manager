import BaseCommand from "@commands/BaseCommand";

/**
 * MoveLabelCommand class
 * This command moves a label associated with a shape to a new position.
 */
class MoveLabelCommand extends BaseCommand {
  /**
   * The labeler to manage labels in the scene.
   * @type {ShapeLabeler}
   */
  #labeler;

  /**
   * The ID of the shape whose label is to be moved.
   * @type {Phaser.GameObjects.Shape}
   */
  #shape;

  /**
   * The old position of the label.
   * @type {Object}
   * @property {number} x - The old x position.
   * @property {number} y - The old y position.
   */
  #oldPosition;

  /**
   * The new position of the label.
   * @type {Object}
   * @property {number} x - The new x position.
   * @property {number} y - The new y position.
   */
  #newPosition;

  /**
   * Creates an instance of MoveLabelCommand.
   * @param {ShapeLabeler} labler - The labeler to manage labels in the scene.
   * @param {Phaser.GameObjects.Shape} shape - The shape whose label is to be moved.
   * @param {Object} oldPosition - The old position of the label.
   * @property {number} oldPosition.x - The old x position.
   * @property {number} oldPosition.y - The old y position.
   * @param {Object} newPosition - The new position of the label.
   * @property {number} newPosition.x - The new x position.
   * @property {number} newPosition.y - The new y position.
   */
  constructor(labler, shape, oldPosition, newPosition) {
    super();
    this.#labeler = labler;
    this.#shape = shape;
    this.#oldPosition = oldPosition;
    this.#newPosition = newPosition;
  }

  /**
   * Executes the command to move the label to the new position.
   * @returns {Promise<void>}
   */
  async execute() {
    const label = this.#labeler.getLabel(this.#shape);
    if (!label) {
      console.warn(`Label for shape ID '${this.#shape}' does not exist.`);
      return;
    }

    label.setPosition(this.#newPosition.x, this.#newPosition.y);
  }

  /**
   * Undoes the command by moving the label back to the old position.
   * @returns {Promise<void>}
   */
  async undo() {
    const label = this.#labeler.getLabel(this.#shape);
    if (!label) {
      console.warn(`Label for shape ID '${this.#shape}' does not exist.`);
      return;
    }

    label.setPosition(this.#oldPosition.x, this.#oldPosition.y);
  }
}

export default MoveLabelCommand;
