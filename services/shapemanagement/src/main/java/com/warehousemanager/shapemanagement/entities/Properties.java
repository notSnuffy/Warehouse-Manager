package com.warehousemanager.shapemanagement.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/** Represents properties associated with a shape in the warehouse management system. */
@Entity
public class Properties {
  /** Unique identifier for the shape. */
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Long id;

  /** X position of the shape in the warehouse. */
  @Column(nullable = false)
  private int positionX;

  /** Y position of the shape in the warehouse. */
  @Column(nullable = false)
  private int positionY;

  /** Width of the shape in the warehouse. */
  @Min(10)
  private Integer width;

  /** Height of the shape in the warehouse. */
  @Min(10)
  private Integer height;

  /** Rotation of the shape in radians. */
  @Column(nullable = false)
  private int rotation = 0;

  /** Start angle of the arc in degrees. */
  @Min(0)
  @Max(360)
  private Integer arcStartAngle;

  /** End angle of the arc in degrees. */
  @Min(0)
  @Max(360)
  private Integer arcEndAngle;

  /** Radius of the arc in pixels. */
  @Min(5)
  private Integer arcRadius;

  /** Default constructor for JPA. */
  protected Properties() {}

  /**
   * Constructs Properties with the specified parameters.
   *
   * @param positionX the X position of the shape
   * @param positionY the Y position of the shape
   */
  public Properties(int positionX, int positionY) {
    this.positionX = positionX;
    this.positionY = positionY;
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
   * Gets the X position of the shape.
   *
   * @return the X position of the shape
   */
  public int getPositionX() {
    return positionX;
  }

  /**
   * Sets the X position of the shape.
   *
   * @param positionX the new X position of the shape
   */
  public void setPositionX(int positionX) {
    this.positionX = positionX;
  }

  /**
   * Gets the Y position of the shape.
   *
   * @return the Y position of the shape
   */
  public int getPositionY() {
    return positionY;
  }

  /**
   * Sets the Y position of the shape.
   *
   * @param positionY the new Y position of the shape
   */
  public void setPositionY(int positionY) {
    this.positionY = positionY;
  }

  /**
   * Gets the width of the shape.
   *
   * @return the width of the shape
   */
  public Integer getWidth() {
    return width;
  }

  /**
   * Sets the width of the shape.
   *
   * @param width the new width of the shape
   */
  public void setWidth(Integer width) {
    this.width = width;
  }

  /**
   * Gets the height of the shape.
   *
   * @return the height of the shape
   */
  public Integer getHeight() {
    return height;
  }

  /**
   * Sets the height of the shape.
   *
   * @param height the new height of the shape
   */
  public void setHeight(Integer height) {
    this.height = height;
  }

  /**
   * Gets the rotation of the shape in radians.
   *
   * @return the rotation of the shape
   */
  public int getRotation() {
    return rotation;
  }

  /**
   * Sets the rotation of the shape in radians.
   *
   * @param rotation the new rotation of the shape
   */
  public void setRotation(int rotation) {
    this.rotation = rotation;
  }

  /**
   * Gets the start angle of the arc in degrees.
   *
   * @return the start angle of the arc
   */
  public Integer getArcStartAngle() {
    return arcStartAngle;
  }

  /**
   * Sets the start angle of the arc in degrees.
   *
   * @param arcStartAngle the new start angle of the arc
   */
  public void setArcStartAngle(Integer arcStartAngle) {
    this.arcStartAngle = arcStartAngle;
  }

  /**
   * Gets the end angle of the arc in degrees.
   *
   * @return the end angle of the arc
   */
  public Integer getArcEndAngle() {
    return arcEndAngle;
  }

  /**
   * Sets the end angle of the arc in degrees.
   *
   * @param arcEndAngle the new end angle of the arc
   */
  public void setArcEndAngle(Integer arcEndAngle) {
    this.arcEndAngle = arcEndAngle;
  }

  /**
   * Gets the radius of the arc in pixels.
   *
   * @return the radius of the arc
   */
  public Integer getArcRadius() {
    return arcRadius;
  }

  /**
   * Sets the radius of the arc in pixels.
   *
   * @param arcRadius the new radius of the arc
   */
  public void setArcRadius(Integer arcRadius) {
    this.arcRadius = arcRadius;
  }
}
