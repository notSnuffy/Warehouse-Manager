import BaseCommand from "@commands/BaseCommand";

/**
 * CompositeCommand class
 * This command aggregates multiple commands and executes or undoes them in sequence.
 */
class CompositeCommand extends BaseCommand {
  /**
   * The list of commands to be executed or undone.
   * @type {BaseCommand[]}
   */
  #commands = [];

  /**
   * Creates an instance of CompositeCommand.
   */
  constructor() {
    super();
    this.#commands = [];
  }

  /**
   * Adds a command to the composite command.
   * @param {BaseCommand} command - The command to add.
   */
  addCommand(command) {
    this.#commands.push(command);
  }

  /**
   * Executes all commands in sequence.
   * @returns {Promise<void>}
   */
  async execute() {
    for (const command of this.#commands) {
      await command.execute();
    }
  }

  /**
   * Undoes all commands in reverse sequence.
   * @return {Promise<void>}
   */
  async undo() {
    for (let i = this.#commands.length - 1; i >= 0; i--) {
      const command = this.#commands[i];
      await command.undo();
    }
  }
}

export default CompositeCommand;
