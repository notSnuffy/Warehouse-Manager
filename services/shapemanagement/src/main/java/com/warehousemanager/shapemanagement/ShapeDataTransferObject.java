package com.warehousemanager.shapemanagement;

import com.warehousemanager.shapemanagement.entities.Properties;
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

  /** Properties associated with the shape, such as position and dimensions. */
  private Properties properties;

  /** Class representing a component of a shape. */
  public static class ComponentDataTransferObject {
    /** Identifier for which shape this represets. */
    private Long shapeId;

    /** Identifier for the container the shape is in. */
    private Long containerId;

    /** Properties that override the default properties of the shape. */
    private Properties propertiesOverride;

    /**
     * Constructor for ComponentDataTransferObject.
     *
     * @param shapeId the ID of the shape
     * @param containerId the ID of the container
     * @param propertiesOverride the properties to override
     */
    public ComponentDataTransferObject(
        Long shapeId, Long containerId, Properties propertiesOverride) {
      this.shapeId = shapeId;
      this.containerId = containerId;
      this.propertiesOverride = propertiesOverride;
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
     * Gets the ID of the container.
     *
     * @return the ID of the container
     */
    public Long getContainerId() {
      return containerId;
    }

    /**
     * Gets the properties that override the default properties of the shape.
     *
     * @return the properties override
     */
    public Properties getPropertiesOverride() {
      return propertiesOverride;
    }
  }

  private List<ComponentDataTransferObject> components = new ArrayList<>();

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
   * Gets the properties associated with the shape.
   *
   * @return the properties of the shape
   */
  public Properties getProperties() {
    return properties;
  }

  /**
   * Sets the properties associated with the shape.
   *
   * @param properties the new properties of the shape
   */
  public void setProperties(Properties properties) {
    this.properties = properties;
  }

  /**
   * Gets the list of components associated with the shape.
   *
   * @return the list of components
   */
  public List<ComponentDataTransferObject> getComponents() {
    return components;
  }

  /**
   * Sets the list of components associated with the shape.
   *
   * @param components the new list of components
   */
  public void setComponents(List<ComponentDataTransferObject> components) {
    this.components = components;
  }
}
