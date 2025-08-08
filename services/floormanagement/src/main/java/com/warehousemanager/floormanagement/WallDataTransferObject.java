package com.warehousemanager.floormanagement;

/** Data Transfer Object (DTO) for Wall entity. */
public class WallDataTransferObject {
  /** Unique identifier for the starting corner of the wall. */
  public Long startCornerId;

  /** Unique identifier for the ending corner of the wall. */
  public Long endCornerId;

  /**
   * Constructs a WallDataTransferObject with the specified parameters.
   *
   * @param startCornerId the unique identifier of the starting corner
   * @param endCornerId the unique identifier of the ending corner
   */
  public WallDataTransferObject(Long startCornerId, Long endCornerId) {
    this.startCornerId = startCornerId;
    this.endCornerId = endCornerId;
  }
}
