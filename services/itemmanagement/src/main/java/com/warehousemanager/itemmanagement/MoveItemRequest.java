package com.warehousemanager.itemmanagement;

import java.util.UUID;

/**
 * Data Transfer Object (DTO) for moving an item within the warehouse hierarchy.
 *
 * @param itemId the unique identifier of the item to be moved
 * @param newParentId the identifier of the new parent item, if applicable
 * @param newZoneId the identifier for the new zone where the item will be stored
 * @param newFloorId the identifier for the new floor where the item will be stored
 */
public record MoveItemRequest(UUID itemId, UUID newParentId, Long newZoneId, Long newFloorId) {}
