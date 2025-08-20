package com.warehousemanager.furnituremanagement;

import java.util.List;

/**
 * Response Data Transfer Object (DTO) for a furniture instance in the warehouse management system.
 *
 * @param id The unique identifier for the furniture instance.
 * @param topDownViewInstance The top-down view instance of the furniture.
 * @param zoneInstances A list of zone instances associated with the furniture.
 * @param furniture The furniture associated with this instance.
 */
public record FurnitureInstanceResponseDataTransferObject(
    Long id,
    ShapeInstance topDownViewInstance,
    List<ZoneInstanceResponseDataTransferObject> zoneInstances,
    FurnitureResponseDataTransferObject furniture) {}
