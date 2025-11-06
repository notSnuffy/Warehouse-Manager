import BaseCommand from "@commands/BaseCommand";

/**
 * Command to edit the label of a shape in a Phaser game.
 * @class EditLabelCommand
 * @extends {BaseCommand}
 */
class EditLabelCommand extends BaseCommand {
  /**
   * The shape labeler instance.
   * @type {ShapeLabeler}
   */
  #labeler;

  /**
   * The shape whose label is being edited.
   * @type {Phaser.GameObjects.Shape}
   */
  #shape;

  /**
   * The old label text.
   * @type {string}
   */
  #oldText;

  /**
   * The new label text.
   * @type {string}
   */
  #newText;

  /**
   * The callback to call after updating the label.
   * @type {Function}
   */
  #updateCallback;

  /**
   * Creates an instance of EditLabelCommand.
   * @param {ShapeLabeler} shapeLabeler - The shape labeler instance.
   * @param {Phaser.GameObjects.Shape} shape - The shape whose label is being edited.
   * @param {string} oldText - The old label text.
   * @param {string} newText - The new label text.
   * @param {Function} updateCallback - The callback to call after updating the label.
   */
  constructor(shapeLabeler, shape, oldText, newText, updateCallback) {
    super();
    this.#labeler = shapeLabeler;
    this.#shape = shape;
    this.#oldText = oldText;
    this.#newText = newText;
    this.#updateCallback = updateCallback;
  }

  /**
   * Executes the command to update the label text.
   * @returns {Promise<void>}
   */
  async execute() {
    const label = this.#labeler.getLabel(this.#shape);
    if (label) {
      label.setText(this.#newText);
      if (this.#updateCallback) {
        this.#updateCallback(this.#shape, this.#newText);
      }
    }
  }

  /**
   * Undoes the command to revert the label text.
   * @returns {Promise<void>}
   */
  async undo() {
    const label = this.#labeler.getLabel(this.#shape);
    if (label) {
      label.setText(this.#oldText);
      if (this.#updateCallback) {
        this.#updateCallback(this.#shape, this.#oldText);
      }
    }
  }
}

export default EditLabelCommand;
