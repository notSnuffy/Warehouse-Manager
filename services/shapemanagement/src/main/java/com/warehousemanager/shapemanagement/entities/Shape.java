package com.warehousemanager.shapemanagement.entities;

import com.warehousemanager.shapemanagement.ShapeId;
import com.warehousemanager.shapemanagement.ShapeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

/** Represents a shape in the warehouse management system. */
@Entity
@IdClass(ShapeId.class)
public class Shape {

  /** Primary key for the shape entity. */
  @Id
  @Column(nullable = false, updatable = false)
  private UUID id = UUID.randomUUID();

  /** Version of the shape. */
  @Id
  @Column(nullable = false, updatable = false)
  private Instant version = Instant.now();

  /** Indicates if this is the current/latest record. */
  @Column(nullable = false)
  private Boolean current = true;

  /** Name of the shape. */
  @Column(nullable = false)
  @NotBlank(message = "Shape name cannot be blank")
  @Size(max = 255, message = "Shape name cannot exceed 255 characters")
  private String name;

  /** Type of the shape, represented by an enum. */
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ShapeType type;

  /** If the shape should be included in the public shape library. */
  @Column(nullable = false)
  private boolean isPublic = false;

  /** If the shape was deleted. (soft delete) */
  @Column(nullable = false)
  private boolean deleted = false;

  /** Default constructor for JPA. */
  protected Shape() {}

  /**
   * Constructs a Shape with the specified name and type.
   *
   * @param name the name of the shape
   * @param type the type of the shape
   */
  public Shape(String name, ShapeType type) {
    this.name = name;
    this.type = type;
  }

  /**
   * Constructs a Shape with the specified id, name, and type.
   *
   * @param id the unique identifier of the shape
   * @param name the name of the shape
   * @param type the type of the shape
   */
  public Shape(UUID id, String name, ShapeType type) {
    this.id = id;
    this.name = name;
    this.type = type;
  }

  /**
   * Copy constructor to create a new Shape based on an existing one with a new version timestamp.
   *
   * @param other the existing Shape to copy
   */
  public Shape(Shape other) {
    this.id = other.id;
    this.version = Instant.now();
    this.name = other.name;
    this.type = other.type;
    this.isPublic = other.isPublic;
    this.deleted = other.deleted;
  }

  /**
   * Gets the unique identifier of the shape.
   *
   * @return the unique identifier of the shape
   */
  public UUID getId() {
    return id;
  }

  /**
   * Gets the version of the shape.
   *
   * @return the version of the shape
   */
  public Instant getVersion() {
    return version;
  }

  /**
   * Checks if this is the current/latest record.
   *
   * @return true if this is the current record, false otherwise
   */
  public Boolean isCurrent() {
    return current;
  }

  /**
   * Sets whether this is the current/latest record.
   *
   * @param current true if this is the current record, false otherwise
   */
  public void setCurrent(Boolean current) {
    this.current = current;
  }

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
   * Sets the publicity of the shape.
   *
   * @param isPublic true if the shape should be public, false otherwise
   */
  public void setPublic(boolean isPublic) {
    this.isPublic = isPublic;
  }

  /**
   * Checks if the shape is deleted.
   *
   * @return true if the shape is deleted, false otherwise
   */
  public boolean isDeleted() {
    return deleted;
  }

  /**
   * Sets the deletion status of the shape.
   *
   * @param deleted true if the shape should be marked as deleted, false otherwise
   */
  public void setDeleted(boolean deleted) {
    this.deleted = deleted;
  }
}
