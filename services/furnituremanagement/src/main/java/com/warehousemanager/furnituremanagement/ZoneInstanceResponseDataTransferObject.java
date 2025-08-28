package com.warehousemanager.furnituremanagement;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Response Data Transfer Object (DTO) for a zone instance in the warehouse management system.
 *
 * @param id The unique identifier for the zone instance.
 * @param zone The zone associated with this instance.
 * @param items A JSON representation of items contained within this zone instance.
 */
public record ZoneInstanceResponseDataTransferObject(
    Long id, ZoneResponseDataTransferObject zone, JsonNode items) {}
