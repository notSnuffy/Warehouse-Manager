package com.warehousemanager.itemmanagement.entities;

import com.warehousemanager.itemmanagement.ItemId;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@IdClass(ItemId.class)
public class Item {
  /** Unique identifier for the item. */
  @Id
  @Column(nullable = false, updatable = false)
  private UUID id = UUID.randomUUID();

  /** Version timestamp for versioning. */
  @Id
  @Column(nullable = false, updatable = false)
  private Instant version = Instant.now();

  /** Indicates if this is the current/latest record. */
  @Column(nullable = false)
  private Boolean current = true;

  /** Flag indicating whether the item is deleted (soft delete). */
  @Column(nullable = false)
  private Boolean deleted = false;

  /** Name of the item. */
  @Column(nullable = false)
  @NotBlank(message = "Item name cannot be blank")
  @Size(max = 255, message = "Item name cannot exceed 255 characters")
  private String name;

  /** Description of the item. */
  private String description;

  /** Category of the item. */
  private String category;

  /** Quantity of the item in stock. */
  private String quantity;

  /** Identifier for the floor where the item is stored. */
  private Long floorId;

  /** Identifier for the zone where the item is stored. */
  private Long zoneId;

  /** Parent item in the hierarchical structure. */
  @ManyToOne
  @JoinColumns({
    @JoinColumn(name = "parent_id", referencedColumnName = "id"),
    @JoinColumn(name = "parent_version", referencedColumnName = "version")
  })
  private Item parent;

  /** List of child items, representing a hierarchical structure. */
  @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
  private List<Item> children = new ArrayList<>();

  /** Default constructor for JPA. */
  protected Item() {}

  /**
   * Constructs an Item with the specified name.
   *
   * @param name the name of the item
   */
  public Item(String name) {
    this.name = name;
  }

  /**
   * Constructs an Item with the specified id and name.
   *
   * @param id the unique identifier of the item
   * @param name the name of the item
   */
  public Item(Long id, String name) {
    this.name = name;
  }

  /**
   * Copy constructor to create a new Item based on another Item. The new Item will have a new
   * version timestamp.
   *
   * @param other the Item to copy from
   */
  public Item(Item other) {
    this.id = other.id;
    this.version = Instant.now();
    this.deleted = other.deleted;
    this.name = other.name;
    this.description = other.description;
    this.category = other.category;
    this.quantity = other.quantity;
    this.floorId = other.floorId;
    this.zoneId = other.zoneId;
    this.parent = other.parent;
    this.children = new ArrayList<>(other.children);
  }

  /**
   * Gets the unique identifier of the item.
   *
   * @return the unique identifier of the item
   */
  public UUID getId() {
    return id;
  }

  /**
   * Gets the version timestamp of the item.
   *
   * @return the version timestamp of the item
   */
  public Instant getVersion() {
    return version;
  }

  /**
   * Gets the current status of the item.
   *
   * @return the current status of the item
   */
  public Boolean getCurrent() {
    return current;
  }

  /**
   * Sets the current status of the item.
   *
   * @param current the new current status of the item
   */
  public void setCurrent(Boolean current) {
    this.current = current;
  }

  /**
   * Gets the deleted status of the item.
   *
   * @return the deleted status of the item
   */
  public Boolean getDeleted() {
    return deleted;
  }

  /**
   * Sets the deleted status of the item.
   *
   * @param deleted the new deleted status of the item
   */
  public void setDeleted(Boolean deleted) {
    this.deleted = deleted;
  }

  /**
   * Gets the name of the item.
   *
   * @return the name of the item
   */
  public String getName() {
    return name;
  }

  /**
   * Sets the name of the item.
   *
   * @param name the new name of the item
   */
  public void setName(String name) {
    this.name = name;
  }

  /**
   * Gets the description of the item.
   *
   * @return the description of the item
   */
  public String getDescription() {
    return description;
  }

  /**
   * Sets the description of the item.
   *
   * @param description the new description of the item
   */
  public void setDescription(String description) {
    this.description = description;
  }

  /**
   * Gets the category of the item.
   *
   * @return the category of the item
   */
  public String getCategory() {
    return category;
  }

  /**
   * Sets the category of the item.
   *
   * @param category the new category of the item
   */
  public void setCategory(String category) {
    this.category = category;
  }

  /**
   * Gets the quantity of the item in stock.
   *
   * @return the quantity of the item in stock
   */
  public String getQuantity() {
    return quantity;
  }

  /**
   * Sets the quantity of the item in stock.
   *
   * @param quantity the new quantity of the item in stock
   */
  public void setQuantity(String quantity) {
    this.quantity = quantity;
  }

  /**
   * Gets the floor ID where the item is stored.
   *
   * @return the floor ID where the item is stored
   */
  public Long getFloorId() {
    return floorId;
  }

  /**
   * Sets the floor ID where the item is stored.
   *
   * @param floorId the new floor ID where the item is stored
   */
  public void setFloorId(Long floorId) {
    this.floorId = floorId;
  }

  /**
   * Gets the zone ID where the item is stored.
   *
   * @return the zone ID where the item is stored
   */
  public Long getZoneId() {
    return zoneId;
  }

  /**
   * Sets the zone ID where the item is stored.
   *
   * @param zoneId the new zone ID where the item is stored
   */
  public void setZoneId(Long zoneId) {
    this.zoneId = zoneId;
  }

  /**
   * Gets the parent item in the hierarchical structure.
   *
   * @return the parent item
   */
  public Item getParent() {
    return parent;
  }

  /**
   * Sets the parent item in the hierarchical structure.
   *
   * @param parent the new parent item
   */
  public void setParent(Item parent) {
    this.parent = parent;
  }

  /**
   * Adds a child item to the list of children and sets this item as the parent of the child.
   *
   * @param child the child item to be added
   */
  public void addChild(Item child) {
    children.add(child);
    child.setParent(this);
  }

  /**
   * Removes a child item from the list of children and clears its parent reference.
   *
   * @param child the child item to be removed
   */
  public void removeChild(Item child) {
    children.remove(child);
    child.setParent(null);
  }

  /**
   * Gets the list of child items.
   *
   * @return the list of child items
   */
  public List<Item> getChildren() {
    return children;
  }

  /**
   * Sets the list of child items.
   *
   * @param children the new list of child items
   */
  public void setChildren(List<Item> children) {
    this.children = children;
    children.forEach(child -> child.setParent(this));
  }
}
