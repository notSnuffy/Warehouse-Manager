package com.warehousemanager.furnituremanagement;

/**
 * Represents a zone data transfer object in the warehouse management system, which is a specific
 * area defined by a shape and associated instructions.
 *
 * @param name The name of the zone.
 * @param shape The shape that defines the zone, including its instructions.
 */
public record ZoneDataTransferObject(String name, Shape shape) {}
