package com.warehousemanager.floormanagement.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

/** Represents a wall in the warehouse floor. */
@Entity
public class Wall {
  /** Unique identifier for the wall. */
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Long id;

  /** The floor that this wall belongs to. */
  @ManyToOne(optional = false)
  private Floor floor;

  /** The start corner of the wall. */
  @ManyToOne(optional = false)
  private Corner startCorner;

  /** The end corner of the wall. */
  @ManyToOne(optional = false)
  private Corner endCorner;

  /** Default constructor for JPA. */
  protected Wall() {}

  /**
   * Constructs a Wall with the specified start and end corners.
   *
   * @param startCorner the starting corner of the wall
   * @param endCorner the ending corner of the wall
   */
  public Wall(Corner startCorner, Corner endCorner) {
    this.startCorner = startCorner;
    this.endCorner = endCorner;
  }

  /**
   * Gets the unique identifier of the wall.
   *
   * @return the unique identifier of the wall
   */
  public Long getId() {
    return id;
  }

  /**
   * Gets the floor that this wall belongs to.
   *
   * @return the floor of the wall
   */
  public Floor getFloor() {
    return floor;
  }

  /**
   * Sets the floor that this wall belongs to.
   *
   * @param floor the floor to set
   */
  public void setFloor(Floor floor) {
    this.floor = floor;
  }

  /**
   * Gets the starting corner of the wall.
   *
   * @return the starting corner of the wall
   */
  public Corner getStartCorner() {
    return startCorner;
  }

  /**
   * Sets the starting corner of the wall.
   *
   * @param startCorner the starting corner to set
   */
  public void setStartCorner(Corner startCorner) {
    this.startCorner = startCorner;
  }

  /**
   * Gets the ending corner of the wall.
   *
   * @return the ending corner of the wall
   */
  public Corner getEndCorner() {
    return endCorner;
  }

  /**
   * Sets the ending corner of the wall.
   *
   * @param endCorner the ending corner to set
   */
  public void setEndCorner(Corner endCorner) {
    this.endCorner = endCorner;
  }
}
