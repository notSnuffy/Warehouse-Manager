package com.warehousemanager.furnituremanagement.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

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

  /** Identifier for the shape instance that represents the zone. */
  @Column(nullable = false)
  private Long shapeId;

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
   */
  public Zone(String name, Long shapeId, Furniture furniture) {
    this.name = name;
    this.shapeId = shapeId;
    this.furniture = furniture;
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
}
