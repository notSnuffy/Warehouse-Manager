package com.warehousemanager.shapemanagement;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.Instant;
import java.util.List;

/** Represents parameters for creating shapes in the warehouse management system. */
public class ShapeParameters {
  /** ID of the shape these parameters represent. */
  public Long shapeId;

  /** Version of the shape at the time these parameters were created. */
  public Instant shapeVersion;

  /** X position of the shape in the warehouse. */
  public double positionX;

  /** Y position of the shape in the warehouse. */
  public double positionY;

  /** Width of the shape in the warehouse. */
  @Min(10)
  public Double width;

  /** Height of the shape in the warehouse. */
  @Min(10)
  public Double height;

  /** Rotation of the shape in radians. */
  public double rotation = 0;

  /** Start angle of the arc in degrees. */
  @Min(0)
  @Max(360)
  public Double arcStartAngle;

  /** End angle of the arc in degrees. */
  @Min(0)
  @Max(360)
  public Double arcEndAngle;

  /** Radius of the arc in pixels. */
  @Min(5)
  public Double arcRadius;

  /**
   * Points defining the shape, used for complex shapes like polygons. All points should be in the
   * format [x1, y1, x2, y2, ...].
   */
  public List<Double> polygonPoints;
}
