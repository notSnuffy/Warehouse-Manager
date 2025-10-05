package com.warehousemanager.floormanagement;

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
  public Double width;

  /** Height of the shape in the warehouse. */
  public Double height;

  /** Rotation of the shape in radians. */
  public double rotation = 0;

  /** Start angle of the arc in degrees. */
  public Double arcStartAngle;

  /** End angle of the arc in degrees. */
  public Double arcEndAngle;

  /** Radius of the arc in pixels. */
  public Double arcRadius;

  /**
   * Points defining the shape, used for complex shapes like polygons. All points should be in the
   * format [x1, y1, x2, y2, ...].
   */
  public List<Double> polygonPoints;
}
