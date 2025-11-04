import BaseCommand from "@commands/BaseCommand";

/**
 * AddLabelCommand class
 * This command adds a label to a shape in the scene.
 */
class AddLabelCommand extends BaseCommand {
  /**
   * The labeler to manage labels in the scene.
   * @type {ShapeLabeler}
   */
  #labler;

  /**
   * The shape to which the label is added.
   * @type {Phaser.GameObjects.Shape}
   */
  #shape;

  /**
   * The text of the label.
   * @type {string}
   */
  #labelText;

  /**
   * The color of the label.
   * @type {string}
   */
  #labelColor;

  /**
   * The callback function to call after updating the label.
   * @type {Function}
   */
  #updateCallback;

  /**
   * Creates an instance of AddLabelCommand.
   * @param {ShapeLabeler} labler - The labeler to manage labels in the scene.
   * @param {Phaser.GameObjects.Shape} shape - The shape to which the label is added.
   * @param {string} labelText - The text of the label.
   * @param {string} [labelColor="#ffffff"] - The color of the label.
   * @param {Function} [updateCallback=()=>{}] - Callback function to call after updating the label.
   */
  constructor(
    labler,
    shape,
    labelText,
    labelColor = "#ffffff",
    updateCallback = () => {},
  ) {
    super();
    this.#labler = labler;
    this.#shape = shape;
    this.#labelText = labelText;
    this.#labelColor = labelColor;
    this.#updateCallback = updateCallback;
  }

  /**
   * Executes the command to add the label to the shape.
   * @returns {Promise<void>}
   */
  async execute() {
    this.#labler.addLabel(
      this.#shape,
      this.#labelText,
      this.#labelColor,
      this.#updateCallback,
    );
  }

  /**
   * Undoes the command by removing the label from the shape.
   * @returns {Promise<void>}
   */
  async undo() {
    this.#labler.removeLabel(this.#shape);
  }
}

export default AddLabelCommand;
