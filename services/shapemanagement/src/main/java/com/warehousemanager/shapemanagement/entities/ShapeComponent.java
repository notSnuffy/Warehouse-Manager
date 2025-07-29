package com.warehousemanager.shapemanagement.entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;

/** Represents a sub-component of a shape in the warehouse management system. */
@Entity
public class ShapeComponent {

  /** Unique identifier for the shape component. */
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Long id;

  /** The container shape that this component belongs to. */
  @ManyToOne(optional = false)
  @JoinColumn(name = "container_id", nullable = false)
  private Shape container;

  /** The component shape that is part of the container. */
  @ManyToOne(optional = false)
  @JoinColumn(name = "component_id", nullable = false)
  private Shape component;

  /** Properties associated with this shape component, such as position and dimensions. */
  @OneToOne(cascade = CascadeType.ALL, optional = false)
  @JoinColumn(name = "properties_id", nullable = false)
  private Properties properties;

  /** Default constructor for JPA. */
  protected ShapeComponent() {}

  /**
   * Constructs a ShapeComponent with the specified parameters.
   *
   * @param container the container shape
   * @param component the component shape
   * @param properties the properties associated with this component
   */
  public ShapeComponent(Shape container, Shape component, Properties properties) {
    this.container = container;
    this.component = component;
    this.properties = properties;
  }

  /**
   * Gets the unique identifier of this shape component.
   *
   * @return the unique identifier
   */
  public Long getId() {
    return id;
  }

  /** Gets the container shape of this component. */
  public Shape getContainer() {
    return container;
  }

  /** Gets the component shape that is part of the container. */
  public Shape getComponent() {
    return component;
  }

  /**
   * Gets the properties associated with this shape component.
   *
   * @return the properties of this component
   */
  public Properties getProperties() {
    return properties;
  }
}
