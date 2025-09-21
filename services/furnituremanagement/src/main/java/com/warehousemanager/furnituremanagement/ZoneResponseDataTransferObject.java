package com.warehousemanager.furnituremanagement;

/**
 * Represents a zone response data transfer object in the warehouse management system, which is a
 * specific area defined by a shape and associated instructions.
 *
 * @param id The unique identifier for the zone.
 * @param name The name of the zone.
 * @param shape The shape instance that defines the zone, including its instructions.
 */
public record ZoneResponseDataTransferObject(Long id, String name, ShapeInstance shape) {}
