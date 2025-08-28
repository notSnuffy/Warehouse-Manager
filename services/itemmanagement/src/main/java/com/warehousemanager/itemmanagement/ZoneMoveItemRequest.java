package com.warehousemanager.itemmanagement;

/**
 * Data Transfer Object (DTO) for moving an item within the warehouse hierarchy.
 *
 * @param itemId the unique identifier of the item to be moved
 * @param oldZoneId the identifier for the current zone where the item is stored
 * @param newZoneId the identifier for the new zone where the item will be stored
 */
public record ZoneMoveItemRequest(Long itemId, Long oldZoneId, Long newZoneId) {}
