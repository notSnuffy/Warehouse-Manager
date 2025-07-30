package com.warehousemanager.shapemanagement.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.ArrayList;
import java.util.List;

/** Represents specific instances of shapes in the warehouse management system. */
@Entity
public class ShapeInstance {
  /** Unique identifier for the shape. */
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Long id;

  /** X position of the shape in the warehouse. */
  @Column(nullable = false)
  private double positionX;

  /** Y position of the shape in the warehouse. */
  @Column(nullable = false)
  private double positionY;

  /** Width of the shape in the warehouse. */
  @Min(10)
  private Double width;

  /** Height of the shape in the warehouse. */
  @Min(10)
  private Double height;

  /** Rotation of the shape in radians. */
  @Column(nullable = false)
  private double rotation = 0;

  /** Start angle of the arc in degrees. */
  @Min(0)
  @Max(360)
  private Double arcStartAngle;

  /** End angle of the arc in degrees. */
  @Min(0)
  @Max(360)
  private Double arcEndAngle;

  /** Radius of the arc in pixels. */
  @Min(5)
  private Double arcRadius;

  /** The shape that this instance represents. */
  @ManyToOne
  @JoinColumn(name = "shape_id", nullable = false)
  private Shape shape;

  /** Components of the shape instance, representing sub-components or parts of the shape. */
  @ManyToMany
  @JoinTable(
      name = "shape_instance_components",
      joinColumns = @JoinColumn(name = "container_id"),
      inverseJoinColumns = @JoinColumn(name = "component_id"))
  private List<ShapeInstance> components = new ArrayList<>();

  /** Default constructor for JPA. */
  protected ShapeInstance() {}

  /**
   * Constructs ShapeInstance with the specified parameters.
   *
   * @param positionX the X position of the shape instance
   * @param positionY the Y position of the shape instance
   * @param shape the shape that this instance represents
   */
  public ShapeInstance(double positionX, double positionY, Shape shape) {
    this.positionX = positionX;
    this.positionY = positionY;
    this.shape = shape;
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
  public double getPositionX() {
    return positionX;
  }

  /**
   * Sets the X position of the shape.
   *
   * @param positionX the new X position of the shape
   */
  public void setPositionX(double positionX) {
    this.positionX = positionX;
  }

  /**
   * Gets the Y position of the shape.
   *
   * @return the Y position of the shape
   */
  public double getPositionY() {
    return positionY;
  }

  /**
   * Sets the Y position of the shape.
   *
   * @param positionY the new Y position of the shape
   */
  public void setPositionY(double positionY) {
    this.positionY = positionY;
  }

  /**
   * Gets the width of the shape.
   *
   * @return the width of the shape
   */
  public Double getWidth() {
    return width;
  }

  /**
   * Sets the width of the shape.
   *
   * @param width the new width of the shape
   */
  public void setWidth(Double width) {
    this.width = width;
  }

  /**
   * Gets the height of the shape.
   *
   * @return the height of the shape
   */
  public Double getHeight() {
    return height;
  }

  /**
   * Sets the height of the shape.
   *
   * @param height the new height of the shape
   */
  public void setHeight(Double height) {
    this.height = height;
  }

  /**
   * Gets the rotation of the shape in radians.
   *
   * @return the rotation of the shape
   */
  public double getRotation() {
    return rotation;
  }

  /**
   * Sets the rotation of the shape in radians.
   *
   * @param rotation the new rotation of the shape
   */
  public void setRotation(double rotation) {
    this.rotation = rotation;
  }

  /**
   * Gets the start angle of the arc in degrees.
   *
   * @return the start angle of the arc
   */
  public Double getArcStartAngle() {
    return arcStartAngle;
  }

  /**
   * Sets the start angle of the arc in degrees.
   *
   * @param arcStartAngle the new start angle of the arc
   */
  public void setArcStartAngle(Double arcStartAngle) {
    this.arcStartAngle = arcStartAngle;
  }

  /**
   * Gets the end angle of the arc in degrees.
   *
   * @return the end angle of the arc
   */
  public Double getArcEndAngle() {
    return arcEndAngle;
  }

  /**
   * Sets the end angle of the arc in degrees.
   *
   * @param arcEndAngle the new end angle of the arc
   */
  public void setArcEndAngle(Double arcEndAngle) {
    this.arcEndAngle = arcEndAngle;
  }

  /**
   * Gets the radius of the arc in pixels.
   *
   * @return the radius of the arc
   */
  public Double getArcRadius() {
    return arcRadius;
  }

  /**
   * Sets the radius of the arc in pixels.
   *
   * @param arcRadius the new radius of the arc
   */
  public void setArcRadius(Double arcRadius) {
    this.arcRadius = arcRadius;
  }

  /**
   * Gets the shape that this instance represents.
   *
   * @return the shape of this instance
   */
  public Shape getShape() {
    return shape;
  }

  /**
   * Sets the shape that this instance represents.
   *
   * @param shape the new shape of this instance
   */
  public void setShape(Shape shape) {
    this.shape = shape;
  }

  /**
   * Gets the components of the shape instance.
   *
   * @return the list of components
   */
  public List<ShapeInstance> getComponents() {
    return components;
  }

  /**
   * Sets the components of the shape instance.
   *
   * @param components the new list of components
   */
  public void setComponents(List<ShapeInstance> components) {
    this.components = components;
  }

  /**
   * Adds a component to the shape instance.
   *
   * @param component the component to add
   */
  public void addComponent(ShapeInstance component) {
    this.components.add(component);
  }
}
