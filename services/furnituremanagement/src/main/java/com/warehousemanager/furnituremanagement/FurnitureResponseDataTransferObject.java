package com.warehousemanager.furnituremanagement;

import java.util.List;

/**
 * Represents a data transfer object for furniture response in the warehouse management system.
 *
 * @param id The unique identifier for the furniture.
 * @param name The name of the furniture.
 * @param topDownView The shape representing the top-down view of the furniture.
 * @param shapes A list of shape instances that define how the furniture should be created.
 * @param zones A list of zones in the furniture where items can be placed.
 */
public record FurnitureResponseDataTransferObject(
    Long id,
    String name,
    ShapeType topDownView,
    List<ShapeInstance> shapes,
    List<ZoneResponseDataTransferObject> zones) {}
