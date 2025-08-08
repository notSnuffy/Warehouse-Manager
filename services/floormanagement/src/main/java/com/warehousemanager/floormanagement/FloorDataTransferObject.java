package com.warehousemanager.floormanagement;

import java.util.List;

/** Data Transfer Object (DTO) for Floor entity. */
public class FloorDataTransferObject {
  public String name;
  public List<CornerDataTransferObject> corners;
  public List<WallDataTransferObject> walls;
}
