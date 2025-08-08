package com.warehousemanager.floormanagement.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Represents a floor in the warehouse. */
@Entity
public class Floor {
  /** The unique identifier for the floor. */
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Long id;

  /** The name of the floor. */
  @Column(nullable = false)
  @NotBlank(message = "Floor name cannot be blank")
  @Size(max = 255, message = "Floor name cannot exceed 255 characters")
  private String name;

  /** Default constructor for JPA. */
  protected Floor() {}

  /**
   * Constructs a Floor with the specified name.
   *
   * @param name the name of the floor
   */
  public Floor(String name) {
    this.name = name;
  }

  /**
   * Gets the unique identifier of the floor.
   *
   * @return the unique identifier of the floor
   */
  public Long getId() {
    return id;
  }

  /**
   * Gets the name of the floor.
   *
   * @return the name of the floor
   */
  public String getName() {
    return name;
  }

  /**
   * Sets the name of the floor.
   *
   * @param name the new name of the floor
   */
  public void setName(String name) {
    this.name = name;
  }
}
