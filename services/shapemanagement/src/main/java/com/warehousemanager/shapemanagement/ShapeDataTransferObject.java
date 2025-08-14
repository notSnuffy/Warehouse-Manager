package com.warehousemanager.shapemanagement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

/** Data Transfer Object (DTO) for Shape entity. */
public class ShapeDataTransferObject {
  /** Name of the shape. */
  @NotBlank(message = "Shape name cannot be blank")
  @Size(max = 255, message = "Shape name cannot exceed 255 characters")
  private String name;

  /** Type of the shape, represented by an enum. */
  private ShapeType type;

  /** If the shape should be included in the public shape library. */
  private boolean isPublic = false;

  /** Instructions for how to create this shape. */
  private List<Instruction> instructions;

  /**
   * Gets the name of the shape.
   *
   * @return the name of the shape
   */
  public String getName() {
    return name;
  }

  /**
   * Sets the name of the shape.
   *
   * @param name the new name of the shape
   */
  public void setName(String name) {
    this.name = name;
  }

  /**
   * Gets the type of the shape.
   *
   * @return the type of the shape
   */
  public ShapeType getType() {
    return type;
  }

  /**
   * Sets the type of the shape.
   *
   * @param type the new type of the shape
   */
  public void setType(ShapeType type) {
    this.type = type;
  }

  /**
   * Checks if the shape is public.
   *
   * @return true if the shape is public, false otherwise
   */
  public boolean isPublic() {
    return isPublic;
  }

  /**
   * Sets the visibility of the shape.
   *
   * @param isPublic true if the shape should be public, false otherwise
   */
  public void setPublic(boolean isPublic) {
    this.isPublic = isPublic;
  }

  /**
   * Gets the instructions for how to create this shape.
   *
   * @return the instructions for creating the shape
   */
  public List<Instruction> getInstructions() {
    return instructions;
  }

  /**
   * Sets the instructions for how to create this shape.
   *
   * @param instructions the new instructions for creating the shape
   */
  public void setInstructions(List<Instruction> instructions) {
    this.instructions = instructions;
  }
}
