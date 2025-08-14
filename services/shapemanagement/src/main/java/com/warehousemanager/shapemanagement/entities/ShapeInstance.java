package com.warehousemanager.shapemanagement.entities;

import com.warehousemanager.shapemanagement.Instruction;
import com.warehousemanager.shapemanagement.InstructionListConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.util.List;
import org.hibernate.annotations.ColumnTransformer;

/** Represents specific instances of shapes in the warehouse management system. */
@Entity
public class ShapeInstance {
  /** Unique identifier for the shape. */
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Long id;

  /** The shape that this instance represents. */
  @ManyToOne
  @JoinColumn(name = "shape_id", nullable = false)
  private Shape shape;

  /** This shape is the base for creating other instances of the given shape. */
  private boolean isTemplate = false;

  /** Instructions for how to create this shape instance. */
  @Column(columnDefinition = "jsonb")
  @Convert(converter = InstructionListConverter.class)
  @ColumnTransformer(write = "?::jsonb")
  private List<Instruction> instructions;

  /** Default constructor for JPA. */
  protected ShapeInstance() {}

  /**
   * Constructs ShapeInstance with the specified parameters.
   *
   * @param shape the shape that this instance represents
   */
  public ShapeInstance(Shape shape, List<Instruction> instructions) {
    this.shape = shape;
    this.instructions = instructions;
  }

  /**
   * Gets the unique identifier of the properties.
   *
   * @return the unique identifier of the properties
   */
  public Long getId() {
    return id;
  }

  /**
   * Gets the shape that this instance represents.
   *
   * @return the shape of this instance
   */
  public Shape getShape() {
    return shape;
  }

  /**
   * Sets the shape that this instance represents.
   *
   * @param shape the new shape of this instance
   */
  public void setShape(Shape shape) {
    this.shape = shape;
  }

  /**
   * Gets the instructions for how to create this shape instance.
   *
   * @return the instructions for this shape instance
   */
  public List<Instruction> getInstructions() {
    return instructions;
  }

  /**
   * Sets the instructions for how to create this shape instance.
   *
   * @param instructions the new instructions for this shape instance
   */
  public void setInstructions(List<Instruction> instructions) {
    this.instructions = instructions;
  }

  /**
   * Gets whether this shape instance is a template for creating other instances.
   *
   * @return true if this instance is a template, false otherwise
   */
  public boolean isTemplate() {
    return isTemplate;
  }

  /**
   * Sets whether this shape instance is a template for creating other instances.
   *
   * @param isTemplate true if this instance should be a template, false otherwise
   */
  public void setTemplate(boolean isTemplate) {
    this.isTemplate = isTemplate;
  }
}
