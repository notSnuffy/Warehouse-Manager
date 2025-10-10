package com.warehousemanager.floormanagement.entities;

import com.warehousemanager.floormanagement.FloorId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;

/** Represents a floor in the warehouse. */
@Entity
@IdClass(FloorId.class)
public class Floor {
  /** The unique identifier for the floor. */
  @Id
  @Column(nullable = false, updatable = false)
  private Long id;

  /** Version timestamp for versioning. */
  @Id
  @Column(nullable = false, updatable = false)
  private Instant version = Instant.now();

  /** Indicates if this is the current/latest record. */
  @Column(nullable = false)
  private Boolean current = true;

  /** Flag indicating whether the floor is deleted (soft delete). */
  @Column(nullable = false)
  private Boolean deleted = false;

  /** The name of the floor. */
  @Column(nullable = false)
  @NotBlank(message = "Floor name cannot be blank")
  @Size(max = 255, message = "Floor name cannot exceed 255 characters")
  private String name;

  /** A list of furniture IDs associated with this floor. */
  List<Long> furnitureIds;

  /** Default constructor for JPA. */
  protected Floor() {}

  /**
   * Constructs a Floor with the specified name.
   *
   * @param name the name of the floor
   */
  public Floor(String name) {
    this.name = name;
  }

  /**
   * Constructs a Floor with the specified id and name.
   *
   * @param id the unique identifier of the floor
   * @param name the name of the floor
   */
  public Floor(Long id, String name) {
    this.id = id;
    this.name = name;
  }

  /**
   * Copy constructor to create a new Floor instance by copying an existing one. The version is
   * updated to the current timestamp.
   *
   * @param other the Floor instance to copy
   */
  public Floor(Floor other) {
    this.id = other.id;
    this.version = Instant.now();
    this.deleted = other.deleted;
    this.name = other.name;
    this.furnitureIds = other.furnitureIds;
  }

  /**
   * Gets the unique identifier of the floor.
   *
   * @return the unique identifier of the floor
   */
  public Long getId() {
    return id;
  }

  /**
   * Gets the version timestamp of the floor.
   *
   * @return the version timestamp of the floor
   */
  public Instant getVersion() {
    return version;
  }

  /**
   * Checks if this is the current/latest record.
   *
   * @return true if this is the current record, false otherwise
   */
  public Boolean getCurrent() {
    return current;
  }

  /**
   * Sets the current status of this record.
   *
   * @param current true if this is the current record, false otherwise
   */
  public void setCurrent(Boolean current) {
    this.current = current;
  }

  /**
   * Checks if the floor is marked as deleted (soft delete).
   *
   * @return true if the floor is deleted, false otherwise
   */
  public Boolean getDeleted() {
    return deleted;
  }

  /**
   * Sets the deleted status of the floor (soft delete).
   *
   * @param deleted true to mark the floor as deleted, false otherwise
   */
  public void setDeleted(Boolean deleted) {
    this.deleted = deleted;
  }

  /**
   * Gets the name of the floor.
   *
   * @return the name of the floor
   */
  public String getName() {
    return name;
  }

  /**
   * Sets the name of the floor.
   *
   * @param name the new name of the floor
   */
  public void setName(String name) {
    this.name = name;
  }

  /**
   * Gets the list of furniture IDs associated with this floor.
   *
   * @return the list of furniture IDs
   */
  public List<Long> getFurnitureIds() {
    return furnitureIds;
  }

  /**
   * Sets the list of furniture IDs associated with this floor.
   *
   * @param furnitureIds the new list of furniture IDs
   */
  public void setFurnitureIds(List<Long> furnitureIds) {
    this.furnitureIds = furnitureIds;
  }
}
