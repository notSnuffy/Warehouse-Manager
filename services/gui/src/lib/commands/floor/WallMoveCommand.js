import BaseCommand from "@commands/BaseCommand";

class WallMoveCommand extends BaseCommand {
  /**
   * The wall to be moved.
   * @type {Phaser.GameObjects.Line}
   */
  #wall;

  /**
   * The old position of the wall.
   * @type {Object}
   * @property {Object} from - The old starting position of the wall.
   * @property {number} from.x - The old starting x position.
   * @property {number} from.y - The old starting y position.
   * @property {Object} to - The old ending position of the wall.
   * @property {number} to.x - The old ending x position.
   * @property {number} to.y - The old ending y position.
   */
  #oldPosition;

  /**
   * The new position of the wall.
   * @type {Object}
   * @property {Object} from - The new starting position of the wall.
   * @property {number} from.x - The new starting x position.
   * @property {number} from.y - The new starting y position.
   * @property {Object} to - The new ending position of the wall.
   * @property {number} to.x - The new ending x position.
   * @property {number} to.y - The new ending y position.
   */
  #newPosition;

  /**
   * Creates an instance of WallMoveCommand.
   * @param {Phaser.GameObjects.Line} wall - The wall to be moved.
   * @param {Object} oldPosition - The old position of the wall.
   * @param {Object} oldPosition.from - The old starting position of the wall.
   * @param {number} oldPosition.from.x - The old starting x position.
   * @param {number} oldPosition.from.y - The old starting y position.
   * @param {Object} oldPosition.to - The old ending position of the wall.
   * @param {number} oldPosition.to.x - The old ending x position.
   * @param {number} oldPosition.to.y - The old ending y position.
   * @param {Object} newPosition - The new position of the wall.
   * @param {Object} newPosition.from - The new starting position of the wall.
   * @param {number} newPosition.from.x - The new starting x position.
   * @param {number} newPosition.from.y - The new starting y position.
   * @param {Object} newPosition.to - The new ending position of the wall.
   * @param {number} newPosition.to.x - The new ending x position.
   * @param {number} newPosition.to.y - The new ending y position.
   */
  constructor(wall, oldPosition, newPosition) {
    super();
    this.#wall = wall;
    this.#oldPosition = oldPosition;
    this.#newPosition = newPosition;
  }

  /**
   * Executes the command to move the wall to the new position.
   * @returns {Promise<void>}
   */
  async execute() {
    this.#wall.setTo(
      this.#newPosition.from.x,
      this.#newPosition.from.y,
      this.#newPosition.to.x,
      this.#newPosition.to.y,
    );
  }
  /**
   * Undoes the command by moving the wall back to the old position.
   * @returns {Promise<void>}
   */
  async undo() {
    this.#wall.setTo(
      this.#oldPosition.from.x,
      this.#oldPosition.from.y,
      this.#oldPosition.to.x,
      this.#oldPosition.to.y,
    );
  }
}

export default WallMoveCommand;
