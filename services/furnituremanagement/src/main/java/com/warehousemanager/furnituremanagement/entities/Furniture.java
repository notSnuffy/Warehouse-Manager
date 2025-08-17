package com.warehousemanager.furnituremanagement.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

/** Represents a piece of furniture. */
@Entity
public class Furniture {
  /** Unique identifier for the furniture. */
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Long id;

  /** Name of the furniture. */
  @Column(nullable = false)
  @NotBlank(message = "Furniture name cannot be blank")
  @Size(max = 255, message = "Furniture name cannot exceed 255 characters")
  private String name;

  /** Identifier for the shape that represents the furniture from a top-down view. */
  @Column(nullable = false)
  private Long topDownViewId;

  /** List of shape instance IDs representing how the furniture should be created. */
  private List<Long> shapeIds;

  /** List of zones in the furniture where items can be placed. */
  @OneToMany(mappedBy = "furniture")
  @JsonManagedReference
  private List<Zone> zones;

  /** Default constructor for JPA. */
  protected Furniture() {}

  /**
   * Constructs a new Furniture instance with the specified name.
   *
   * @param name the name of the furniture
   * @param topDownViewId the identifier for the shape that represents the furniture from a top-down
   *     view
   */
  public Furniture(String name, Long topDownViewId) {
    this.name = name;
    this.topDownViewId = topDownViewId;
  }

  /**
   * Gets the unique identifier of the furniture.
   *
   * @return the unique identifier of the furniture
   */
  public Long getId() {
    return id;
  }

  /**
   * Gets the name of the furniture.
   *
   * @return the name of the furniture
   */
  public String getName() {
    return name;
  }

  /**
   * Sets the name of the furniture.
   *
   * @param name the new name of the furniture
   */
  public void setName(String name) {
    this.name = name;
  }

  /**
   * Gets the identifier for the shape that represents the furniture from a top-down view.
   *
   * @return the identifier for the top-down view shape
   */
  public Long getTopDownViewId() {
    return topDownViewId;
  }

  /**
   * Sets the identifier for the shape that represents the furniture from a top-down view.
   *
   * @param topDownViewId the new identifier for the top-down view shape
   */
  public void setTopDownViewId(Long topDownViewId) {
    this.topDownViewId = topDownViewId;
  }

  /**
   * Gets the identifiers of the shape instances that represent how the furniture should be created.
   *
   * @return the list of shape instance identifiers
   */
  public List<Long> getShapeIds() {
    return shapeIds;
  }

  /**
   * Sets the identifiers of the shape instances that represent how the furniture should be created.
   *
   * @param shapeIds the new list of shape instance identifiers
   */
  public void setShapeIds(List<Long> shapeIds) {
    this.shapeIds = shapeIds;
  }

  /**
   * Gets the list of zones in the furniture where items can be placed.
   *
   * @return the list of zones in the furniture
   */
  public List<Zone> getZones() {
    return zones;
  }

  /**
   * Sets the list of zones in the furniture where items can be placed.
   *
   * @param zones the new list of zones in the furniture
   */
  public void setZones(List<Zone> zones) {
    this.zones = zones;
  }
}
