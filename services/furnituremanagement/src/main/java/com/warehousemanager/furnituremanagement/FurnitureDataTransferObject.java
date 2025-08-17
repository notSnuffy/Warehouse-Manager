package com.warehousemanager.furnituremanagement;

import java.util.List;

/** Represents a data transfer object for furniture in the warehouse management system. */
public record FurnitureDataTransferObject(
    String name, List<Shape> shapes, List<ZoneDataTransferObject> zones, Long topDownViewId) {}
