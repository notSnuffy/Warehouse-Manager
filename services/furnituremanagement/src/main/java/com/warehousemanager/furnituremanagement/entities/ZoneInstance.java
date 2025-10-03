package com.warehousemanager.furnituremanagement.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.util.HashSet;
import java.util.Set;

@Entity
public class ZoneInstance {
  /** Unique identifier for the zone instance. */
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Long id;

  /** The zone that this instance represents. */
  @ManyToOne
  @JoinColumn(name = "zone_id", nullable = false)
  private Zone zone;

  /** The furniture instance that this zone belongs to. */
  @ManyToOne
  @JoinColumn(name = "furniture_instance_id", nullable = false)
  @JsonBackReference
  private FurnitureInstance furnitureInstance;

  /** A set of item IDs that are placed in this zone instance. */
  @ElementCollection
  @CollectionTable(
      name = "zone_instance_items",
      joinColumns = @JoinColumn(name = "zone_instance_id"))
  @Column(name = "item_id")
  private Set<Long> itemIds = new HashSet<>();

  /** Default constructor for JPA. */
  protected ZoneInstance() {}

  /**
   * Constructs a new ZoneInstance with the specified zone and furniture instance.
   *
   * @param zone the zone that this instance represents
   * @param furnitureInstance the furniture instance that this zone belongs to
   */
  public ZoneInstance(Zone zone, FurnitureInstance furnitureInstance) {
    this.zone = zone;
    this.furnitureInstance = furnitureInstance;
  }

  /**
   * Gets the unique identifier of the zone.
   *
   * @return the unique identifier of the zone
   */
  public Long getId() {
    return id;
  }

  /**
   * Gets the zone that this instance represents.
   *
   * @return the zone that this instance represents
   */
  public Zone getZone() {
    return zone;
  }

  /**
   * Sets the zone that this instance represents.
   *
   * @param zone the zone to set
   */
  public void setZone(Zone zone) {
    this.zone = zone;
  }

  /**
   * Gets the furniture instance that this zone belongs to. * @return the furniture instance that
   * this zone belongs to
   */
  public FurnitureInstance getFurnitureInstance() {
    return furnitureInstance;
  }

  /**
   * Sets the furniture instance that this zone belongs to.
   *
   * @param furnitureInstance the furniture instance to set
   */
  public void setFurnitureInstance(FurnitureInstance furnitureInstance) {
    this.furnitureInstance = furnitureInstance;
  }

  /**
   * Gets the set of item IDs that are placed in this zone instance.
   *
   * @return the set of item IDs
   */
  public Set<Long> getItemIds() {
    return itemIds;
  }

  /**
   * Sets the list of item IDs that are placed in this zone instance.
   *
   * @param itemIds the new list of item IDs
   */
  public void setItemIds(Set<Long> itemIds) {
    this.itemIds = itemIds;
  }

  /**
   * Adds an item ID to the set of item IDs in this zone instance.
   *
   * @param itemId the item ID to add
   */
  public void addItemId(Long itemId) {
    this.itemIds.add(itemId);
  }

  /**
   * Removes an item ID from the set of item IDs in this zone instance.
   *
   * @param itemId the item ID to remove
   */
  public void removeItemId(Long itemId) {
    this.itemIds.remove(itemId);
  }

  /**
   * Checks if the specified item ID is present in the set of item IDs in this zone instance.
   *
   * @param itemId the item ID to check
   * @return true if the item ID is present, false otherwise
   */
  public boolean containsItemId(Long itemId) {
    return this.itemIds.contains(itemId);
  }
}
