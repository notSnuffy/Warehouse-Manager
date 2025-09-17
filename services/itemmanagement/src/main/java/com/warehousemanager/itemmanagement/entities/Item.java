package com.warehousemanager.itemmanagement.entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Item {
  /** Unique identifier for the item. */
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Long id;

  /** Flag indicating whether the item is deleted (soft delete). */
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

  // /** List of child items, representing a hierarchical structure. */
  // @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
  // @JoinTable(
  //     name = "item_children",
  //     joinColumns = @JoinColumn(name = "parent_id"),
  //     inverseJoinColumns = @JoinColumn(name = "child_id"))
  // private List<Item> children = new ArrayList<>();

  /** Parent item in the hierarchical structure. */
  @ManyToOne
  @JoinColumn(name = "parent_id")
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
   * Gets the unique identifier of the item.
   *
   * @return the unique identifier of the item
   */
  public Long getId() {
    return id;
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
