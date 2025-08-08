package com.warehousemanager.floormanagement.entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import java.util.HashSet;
import java.util.Set;

/** Represents a corner in the warehouse floor. */
@Entity
public class Corner {
  /** Unique identifier for the corner. */
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Long id;

  private float positionX;
  private float positionY;

  /** The floor that this corner belongs to. */
  @ManyToOne(optional = false)
  private Floor floor;

  @OneToMany(mappedBy = "startCorner", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<Wall> wallsFromCorner = new HashSet<>();

  @OneToMany(mappedBy = "endCorner", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<Wall> wallsToCorner = new HashSet<>();

  /** Default constructor for JPA. */
  protected Corner() {}

  /**
   * Constructs a Corner with the specified position.
   *
   * @param positionX the X position of the corner
   * @param positionY the Y position of the corner
   */
  public Corner(float positionX, float positionY) {
    this.positionX = positionX;
    this.positionY = positionY;
  }

  /**
   * Gets the unique identifier of the corner.
   *
   * @return the unique identifier of the corner
   */
  public Long getId() {
    return id;
  }

  /**
   * Gets the X position of the corner.
   *
   * @return the X position of the corner
   */
  public float getPositionX() {
    return positionX;
  }

  /**
   * Sets the X position of the corner.
   *
   * @param positionX the new X position of the corner
   */
  public void setPositionX(float positionX) {
    this.positionX = positionX;
  }

  /**
   * Gets the Y position of the corner.
   *
   * @return the Y position of the corner
   */
  public float getPositionY() {
    return positionY;
  }

  /**
   * Sets the Y position of the corner.
   *
   * @param positionY the new Y position of the corner
   */
  public void setPositionY(float positionY) {
    this.positionY = positionY;
  }

  /**
   * Gets the floor that this corner belongs to.
   *
   * @return the floor of the corner
   */
  public Floor getFloor() {
    return floor;
  }

  /**
   * Sets the floor that this corner belongs to.
   *
   * @param floor the new floor of the corner
   */
  public void setFloor(Floor floor) {
    this.floor = floor;
  }

  /**
   * Gets the walls originating from this corner.
   *
   * @return the set of walls originating from this corner
   */
  public Set<Wall> getWallsFromCorner() {
    return wallsFromCorner;
  }

  /**
   * Sets the walls originating from this corner.
   *
   * @param wallsFromCorner the new set of walls originating from this corner
   */
  public void setWallsFromCorner(Set<Wall> wallsFromCorner) {
    this.wallsFromCorner = wallsFromCorner;
  }

  /**
   * Gets the walls ending at this corner.
   *
   * @return the set of walls ending at this corner
   */
  public Set<Wall> getWallsToCorner() {
    return wallsToCorner;
  }

  /**
   * Sets the walls ending at this corner.
   *
   * @param wallsToCorner the new set of walls ending at this corner
   */
  public void setWallsToCorner(Set<Wall> wallsToCorner) {
    this.wallsToCorner = wallsToCorner;
  }
}
