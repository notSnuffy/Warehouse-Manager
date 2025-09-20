package com.warehousemanager.shapemanagement.entities;

import com.warehousemanager.shapemanagement.ShapeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Represents a shape in the warehouse management system. */
@Entity
@Table(
    name = "shapes",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"shape_id", "version"})})
public class Shape {

  /** Primary key for the shape entity. */
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Long id;

  /** Identifier for the shape, shared among different versions of the same shape. */
  private Long shapeId;

  /** Version of the shape. */
  @Column(nullable = false)
  private Long version = 1L;

  /** Name of the shape. */
  @Column(nullable = false, unique = true)
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
   * Constructs a Shape with the specified parameters.
   *
   * @param id the unique identifier of the shape
   * @param version the version of the shape
   * @param name the name of the shape
   * @param type the type of the shape
   */
  public Shape(Long id, Long version, String name, ShapeType type) {
    this.shapeId = id;
    this.version = version;
    this.name = name;
    this.type = type;
  }

  /**
   * Gets the primary key.
   *
   * @return the primary key
   */
  public Long getId() {
    return id;
  }

  /**
   * Gets the identifier for the shape.
   *
   * @return the shape identifier
   */
  public Long getShapeId() {
    return shapeId;
  }

  /**
   * Sets the identifier for the shape.
   *
   * @param shapeId the new shape identifier
   */
  public void setShapeId(Long shapeId) {
    this.shapeId = shapeId;
  }

  /**
   * Gets the version of the shape.
   *
   * @return the version of the shape
   */
  public Long getVersion() {
    return version;
  }

  /**
   * Sets the version of the shape.
   *
   * @param version the new version of the shape
   */
  public void setVersion(Long version) {
    this.version = version;
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
