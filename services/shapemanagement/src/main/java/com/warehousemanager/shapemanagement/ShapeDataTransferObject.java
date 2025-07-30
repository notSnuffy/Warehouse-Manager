package com.warehousemanager.shapemanagement;

import java.util.ArrayList;
import java.util.List;

/** Data Transfer Object (DTO) for Shape entity. */
public class ShapeDataTransferObject {
  /** Name of the shape. */
  private String name;

  /** Type of the shape, represented by an enum. */
  private ShapeType type;

  /** If the shape should be included in the public shape library. */
  private boolean isPublic = false;

  /** Class representing a component of a shape. */
  public static class ComponentDataTransferObject {
    /** Identifier for which shape this represets. */
    private Long shapeId;

    /** X position of the shape in the warehouse. */
    private int positionX;

    /** Y position of the shape in the warehouse. */
    private int positionY;

    /** Width of the shape in the warehouse. */
    private Integer width;

    /** Height of the shape in the warehouse. */
    private Integer height;

    /** Rotation of the shape in radians. */
    private int rotation = 0;

    /** Start angle of the arc in degrees. */
    private Integer arcStartAngle;

    /** End angle of the arc in degrees. */
    private Integer arcEndAngle;

    /** Radius of the arc in pixels. */
    private Integer arcRadius;

    /** List of components that this shape contains. */
    private List<ComponentDataTransferObject> components = new ArrayList<>();

    /**
     * Constructor for ComponentDataTransferObject.
     *
     * @param positionX the X position of the shape
     * @param positionY the Y position of the shape
     */
    public ComponentDataTransferObject(int positionX, int positionY) {
      this.positionX = positionX;
      this.positionY = positionY;
    }

    /**
     * Gets the ID of the shape.
     *
     * @return the ID of the shape
     */
    public Long getShapeId() {
      return shapeId;
    }

    /**
     * Sets the ID of the shape.
     *
     * @param shapeId the new ID of the shape
     */
    public void setShapeId(Long shapeId) {
      this.shapeId = shapeId;
    }

    /**
     * Gets the X position of the shape in the warehouse.
     *
     * @return the X position of the shape
     */
    public int getPositionX() {
      return positionX;
    }

    /**
     * Gets the Y position of the shape in the warehouse.
     *
     * @return the Y position of the shape
     */
    public int getPositionY() {
      return positionY;
    }

    /**
     * Gets the width of the shape in the warehouse.
     *
     * @return the width of the shape
     */
    public Integer getWidth() {
      return width;
    }

    /**
     * Sets the width of the shape in the warehouse.
     *
     * @param width the new width of the shape
     */
    public void setWidth(Integer width) {
      this.width = width;
    }

    /**
     * Gets the height of the shape in the warehouse.
     *
     * @return the height of the shape
     */
    public Integer getHeight() {
      return height;
    }

    /**
     * Sets the height of the shape in the warehouse.
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

    /**
     * Gets the list of components associated with this shape.
     *
     * @return the list of components
     */
    public List<ComponentDataTransferObject> getComponents() {
      return components;
    }

    /**
     * Sets the list of components associated with this shape.
     *
     * @param components the new list of components
     */
    public void setComponents(List<ComponentDataTransferObject> components) {
      this.components = components;
    }
  }

  /** Root component of the shape, which may contain other components. */
  private ComponentDataTransferObject root;

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
   * Sets the visibility of the shape.
   *
   * @param isPublic true if the shape should be public, false otherwise
   */
  public void setPublic(boolean isPublic) {
    this.isPublic = isPublic;
  }

  /**
   * Gets the root component of the shape, which may contain other components.
   *
   * @return the root component of the shape
   */
  public ComponentDataTransferObject getRoot() {
    return root;
  }

  /**
   * Sets the root component of the shape, which may contain other components.
   *
   * @param root the new root component of the shape
   */
  public void setRoot(ComponentDataTransferObject root) {
    this.root = root;
  }
}
