package com.warehousemanager.furnituremanagement;

import java.util.List;

/**
 * Response Data Transfer Object (DTO) for a zone instance in the warehouse management system.
 *
 * @param id The unique identifier for the zone instance.
 * @param zone The zone associated with this instance.
 * @param itemIds A list of item IDs that are part of this zone instance.
 */
public record ZoneInstanceResponseDataTransferObject(
    Long id, ZoneResponseDataTransferObject zone, List<Long> itemIds) {}
