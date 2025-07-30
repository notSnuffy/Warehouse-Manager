package com.warehousemanager.shapemanagement.entities;

import com.warehousemanager.shapemanagement.ShapeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Represents a shape in the warehouse management system. */
@Entity
public class Shape {

  /** Unique identifier for the shape. */
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Long id;

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

  /** If the shape should be shown in the list of shapes, i.e. it was not deleted. */
  @Column(nullable = false)
  private boolean isVisible = true;

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
   * Gets the unique identifier of the shape.
   *
   * @return the unique identifier of the shape
   */
  public Long getId() {
    return id;
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
   * Checks if the shape is visible.
   *
   * @return true if the shape is visible, false otherwise
   */
  public boolean isVisible() {
    return isVisible;
  }

  /**
   * Sets the visibility of the shape.
   *
   * @param isVisible true if the shape should be visible, false otherwise
   */
  public void setVisible(boolean isVisible) {
    this.isVisible = isVisible;
  }
}
