package com.warehousemanager.furnituremanagement.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.warehousemanager.furnituremanagement.Instruction;
import com.warehousemanager.furnituremanagement.InstructionListConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import org.hibernate.annotations.ColumnTransformer;

@Entity
public class Zone {
  /** Unique identifier for the zone. */
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Long id;

  /** Name of the zone. */
  @Column(nullable = false)
  @NotBlank(message = "Zone name cannot be blank")
  @Size(max = 255, message = "Zone name cannot exceed 255 characters")
  private String name;

  /** Identifier for the shape type that represents the zone. */
  @Column(nullable = false)
  private Long shapeId;

  /** Instructions for how to create this shape instance. */
  @Column(columnDefinition = "jsonb")
  @Convert(converter = InstructionListConverter.class)
  @ColumnTransformer(write = "?::jsonb")
  private List<Instruction> instructions;

  /** The furniture that this zone belongs to. */
  @ManyToOne
  @JoinColumn(name = "furniture_id", nullable = false)
  @JsonBackReference
  private Furniture furniture;

  /** Default constructor for JPA. */
  protected Zone() {}

  /**
   * Constructs a new Zone instance with the specified name.
   *
   * @param name the name of the zone
   * @param shapeId the identifier for the shape instance that represents the zone
   * @param furniture the furniture that this zone belongs to
   * @param instructions the instructions for how to create this shape instance
   */
  public Zone(String name, Long shapeId, Furniture furniture, List<Instruction> instructions) {
    this.name = name;
    this.shapeId = shapeId;
    this.furniture = furniture;
    this.instructions = instructions;
  }

  /**
   * Gets the unique identifier of the zone.
   *
   * @return the unique identifier of the zone
   */
  public Long getId() {
    return id;
  }

  /**
   * Gets the name of the zone.
   *
   * @return the name of the zone
   */
  public String getName() {
    return name;
  }

  /**
   * Sets the name of the zone.
   *
   * @param name the new name of the zone
   */
  public void setName(String name) {
    this.name = name;
  }

  /**
   * Gets the identifier for the shape that represents the zone.
   *
   * @return the identifier for the shape that represents the zone
   */
  public Long getShapeId() {
    return shapeId;
  }

  /**
   * Sets the identifier for the shape that represents the zone.
   *
   * @param shapeId the new identifier for the shape that represents the zone
   */
  public void setShapeId(Long shapeId) {
    this.shapeId = shapeId;
  }

  /**
   * Gets the furniture that this zone belongs to.
   *
   * @return the furniture that this zone belongs to
   */
  public Furniture getFurniture() {
    return furniture;
  }

  /**
   * Sets the furniture that this zone belongs to.
   *
   * @param furniture the new furniture that this zone belongs to
   */
  public void setFurniture(Furniture furniture) {
    this.furniture = furniture;
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
}
