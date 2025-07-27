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
  private int rotation;

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
}
