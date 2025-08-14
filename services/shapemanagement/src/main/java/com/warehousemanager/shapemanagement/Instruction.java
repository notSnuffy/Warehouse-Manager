package com.warehousemanager.shapemanagement;

/**
 * Represents an instruction for creating a shape in the warehouse management system. Each
 * instruction consists of a command type and associated parameters.
 */
public class Instruction {
  /** Command type of the instruction. */
  private String command;

  /** Parameters for the instruction. */
  private ShapeParameters parameters;

  /** Empty constructor for Jackson deserialization. */
  public Instruction() {}

  /**
   * Constructs an Instruction with the specified type and parameters.
   *
   * @param command the command type of the instruction
   * @param parameters the parameters for the instruction
   */
  public Instruction(String command, ShapeParameters parameters) {
    this.command = command;
    this.parameters = parameters;
  }

  /**
   * Gets the command type of the instruction.
   *
   * @return the command type of the instruction
   */
  public String getCommand() {
    return command;
  }

  /**
   * Sets the command type of the instruction.
   *
   * @param command the new command type of the instruction
   */
  public void setCommand(String command) {
    this.command = command;
  }

  /**
   * Gets the parameters for the instruction.
   *
   * @return the parameters for the instruction
   */
  public ShapeParameters getParameters() {
    return parameters;
  }

  /**
   * Sets the parameters for the instruction.
   *
   * @param parameters the new parameters for the instruction
   */
  public void setParameters(ShapeParameters parameters) {
    this.parameters = parameters;
  }
}
