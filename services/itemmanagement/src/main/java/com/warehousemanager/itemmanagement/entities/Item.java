package com.warehousemanager.itemmanagement.entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
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

  /** List of child items, representing a hierarchical structure. */
  @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
  @JoinTable(
      name = "item_children",
      joinColumns = @JoinColumn(name = "parent_id"),
      inverseJoinColumns = @JoinColumn(name = "child_id"))
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
   * Gets the name of the item.
   *
   * @return the name of the item
   */
  public String getName() {
    return name;
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
  }
}
