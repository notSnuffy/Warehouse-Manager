package com.warehousemanager.furnituremanagement.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import java.util.List;

/** Represents a furniture instance. */
@Entity
public class FurnitureInstance {
  /** Unique identifier for the furniture instance. */
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Long id;

  /** Identifier for the shape instance that represents the furniture from a top-down view. */
  @Column(nullable = false)
  private Long topDownViewInstanceId;

  /** List of zone instances in the furniture where items can be placed. */
  @OneToMany(mappedBy = "furnitureInstance")
  @JsonManagedReference
  private List<ZoneInstance> zoneInstances;

  /** The furniture that this instance represents. */
  @ManyToOne
  @JoinColumns({
    @JoinColumn(name = "furniture_id", referencedColumnName = "id", nullable = false),
    @JoinColumn(name = "furniture_version", referencedColumnName = "version", nullable = false)
  })
  private Furniture furniture;

  /** Default constructor for JPA. */
  protected FurnitureInstance() {}

  /**
   * Constructs a new FurnitureInstance with the specified furniture and top-down view instance.
   *
   * @param furniture the furniture that this instance represents
   * @param topDownViewInstanceId the identifier for the shape instance that represents the
   *     furniture from a top-down view
   */
  public FurnitureInstance(Furniture furniture, Long topDownViewInstanceId) {
    this.furniture = furniture;
    this.topDownViewInstanceId = topDownViewInstanceId;
  }

  /**
   * Gets the unique identifier of the furniture.
   *
   * @return the unique identifier of the furniture
   */
  public Long getId() {
    return id;
  }

  /**
   * Gets the identifier for the shape instance that represents the furniture from a top-down view.
   *
   * @return the identifier for the top-down view shape instance
   */
  public Long getTopDownViewInstanceId() {
    return topDownViewInstanceId;
  }

  /**
   * Sets the identifier for the shape that represents the furniture from a top-down view.
   *
   * @param topDownViewId the new identifier for the top-down view shape
   */
  public void setTopDownViewId(Long topDownViewId) {
    this.topDownViewInstanceId = topDownViewId;
  }

  /**
   * Gets the zone instances in the furniture where items can be placed.
   *
   * @return the list of zone instances in the furniture
   */
  public List<ZoneInstance> getZoneInstances() {
    return zoneInstances;
  }

  /**
   * Sets the zone instances in the furniture where items can be placed.
   *
   * @param zoneInstances the new list of zone instances in the furniture
   */
  public void setZoneInstances(List<ZoneInstance> zoneInstances) {
    this.zoneInstances = zoneInstances;
  }

  /**
   * Gets the furniture that this instance represents.
   *
   * @return the furniture that this instance represents
   */
  public Furniture getFurniture() {
    return furniture;
  }

  /**
   * Sets the furniture that this instance represents.
   *
   * @param furniture the new furniture that this instance represents
   */
  public void setFurniture(Furniture furniture) {
    this.furniture = furniture;
  }
}
