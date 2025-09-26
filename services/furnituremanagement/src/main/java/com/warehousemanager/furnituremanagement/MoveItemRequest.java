package com.warehousemanager.furnituremanagement;

import java.util.UUID;

/**
 * Data Transfer Object (DTO) for moving an item within the warehouse hierarchy.
 *
 * @param itemId the unique identifier of the item to be moved
 * @param oldZoneId the identifier for the current zone where the item is stored
 * @param newZoneId the identifier for the new zone where the item will be stored
 */
public record MoveItemRequest(UUID itemId, Long oldZoneId, Long newZoneId) {}
