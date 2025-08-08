package com.warehousemanager.floormanagement;

/** Data Transfer Object (DTO) for Corner entity. */
public class CornerDataTransferObject {
  /** Unique identifier for the corner. */
  public Long id;

  /** The X position of the corner. */
  public float positionX;

  /** The Y position of the corner. */
  public float positionY;

  /**
   * Constructs a CornerDataTransferObject with the specified parameters.
   *
   * @param id the unique identifier of the corner
   * @param positionX the X position of the corner
   * @param positionY the Y position of the corner
   */
  public CornerDataTransferObject(Long id, float positionX, float positionY) {
    this.id = id;
    this.positionX = positionX;
    this.positionY = positionY;
  }
}
