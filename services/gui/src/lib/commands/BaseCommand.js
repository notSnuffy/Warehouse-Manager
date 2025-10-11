/**
 * BaseCommand class
 * This is an abstract class that defines the interface for all command classes.
 */
class BaseCommand {
  /**
   * Prevents direct instantiation of the BaseCommand class.
   * @throws {TypeError} If instantiated directly.
   */
  constructor() {
    if (new.target === BaseCommand) {
      throw new TypeError("Cannot construct BaseCommand instances directly");
    }
  }

  /**
   * Executes the command.
   * @abstract
   * @returns {Promise<void>}
   * @throws {Error} If the method is not implemented in the subclass.
   */
  async execute() {
    throw new Error("Method 'execute()' must be implemented.");
  }

  /**
   * Undoes the command.
   * @abstract
   * @returns {Promise<void>}
   * @throws {Error} If the method is not implemented in the subclass.
   */
  async undo() {
    throw new Error("Method 'undo()' must be implemented.");
  }
}

export default BaseCommand;
