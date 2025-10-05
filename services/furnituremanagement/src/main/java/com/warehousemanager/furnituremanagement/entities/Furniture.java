package com.warehousemanager.furnituremanagement.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.warehousemanager.furnituremanagement.FurnitureId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;

/** Represents a piece of furniture. */
@Entity
@IdClass(FurnitureId.class)
public class Furniture {
  /** Unique identifier for the furniture. */
  @Id
  @Column(nullable = false, updatable = false)
  private Long id;

  /** Version of the furniture. */
  @Id
  @Column(nullable = false, updatable = false)
  private Instant version = Instant.now();

  /** Indicates if this is the current/latest record. */
  @Column(nullable = false)
  private Boolean current = true;

  /** Flag indicating whether the furniture is deleted (soft delete). */
  @Column(nullable = false)
  private Boolean deleted = false;

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
   * Constructs a Furniture with the specified id, name, and topDownViewId.
   *
   * @param id the unique identifier for the furniture
   * @param name the name of the furniture
   * @param topDownViewId the identifier for the shape that represents the furniture from a top-down
   *     view
   */
  public Furniture(Long id, String name, Long topDownViewId) {
    this.id = id;
    this.name = name;
    this.topDownViewId = topDownViewId;
  }

  /**
   * Copy constructor to create a new Furniture instance by copying another instance. The version is
   * set to the current time to indicate a new version.
   *
   * @param other the Furniture instance to copy
   */
  public Furniture(Furniture other) {
    this.id = other.id;
    this.version = Instant.now();
    this.deleted = other.deleted;
    this.name = other.name;
    this.topDownViewId = other.topDownViewId;
    this.shapeIds = other.shapeIds;
    this.zones = other.zones;
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
   * Gets the version of the furniture.
   *
   * @return the version of the furniture
   */
  public Instant getVersion() {
    return version;
  }

  /**
   * Checks if this is the current/latest record of the furniture.
   *
   * @return true if this is the current record, false otherwise
   */
  public Boolean getCurrent() {
    return current;
  }

  /**
   * Sets whether this is the current/latest record of the furniture.
   *
   * @param current true if this is the current record, false otherwise
   */
  public void setCurrent(Boolean current) {
    this.current = current;
  }

  /**
   * Gets the deleted status of the furniture.
   *
   * @return the deleted status of the furniture
   */
  public Boolean getDeleted() {
    return deleted;
  }

  /**
   * Sets the deleted status of the furniture.
   *
   * @param deleted the new deleted status of the furniture
   */
  public void setDeleted(Boolean deleted) {
    this.deleted = deleted;
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
