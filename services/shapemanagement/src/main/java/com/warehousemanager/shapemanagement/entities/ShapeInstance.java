package com.warehousemanager.shapemanagement.entities;

import com.warehousemanager.shapemanagement.Instruction;
import com.warehousemanager.shapemanagement.InstructionListConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import java.time.Instant;
import java.util.List;
import org.hibernate.annotations.ColumnTransformer;

/** Represents specific instances of shapes in the warehouse management system. */
@Entity
public class ShapeInstance {
  /** Unique identifier for the shape. */
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "shape_instance_seq_gen")
  @SequenceGenerator(
      name = "shape_instance_seq_gen",
      sequenceName = "shape_instance_seq",
      allocationSize = 1)
  private Long id;

  /** ID of the shape that this instance represents. */
  @Column(nullable = false)
  private Long shapeId;

  /** Version of the shape at the time this instance was created. */
  @Column(nullable = false)
  private Instant shapeVersion;

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
   * @param shapeId the ID of the shape that this instance represents
   * @param shapeVersion the version of the shape at the time this instance was created
   * @param instructions the instructions for how to create this shape instance
   */
  public ShapeInstance(Long shapeId, Instant shapeVersion, List<Instruction> instructions) {
    this.shapeId = shapeId;
    this.shapeVersion = shapeVersion;
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
   * Gets the ID of the shape that this instance represents.
   *
   * @return the shape ID
   */
  public Long getShapeId() {
    return shapeId;
  }

  /**
   * Sets the ID of the shape that this instance represents.
   *
   * @param shapeId the new shape ID
   */
  public void setShapeId(Long shapeId) {
    this.shapeId = shapeId;
  }

  /**
   * Gets the version of the shape at the time this instance was created.
   *
   * @return the shape version
   */
  public Instant getShapeVersion() {
    return shapeVersion;
  }

  /**
   * Sets the version of the shape at the time this instance was created.
   *
   * @param shapeVersion the new shape version
   */
  public void setShapeVersion(Instant shapeVersion) {
    this.shapeVersion = shapeVersion;
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
