package com.warehousemanager.furnituremanagement;

import java.util.List;

/**
 * Represents a zone data transfer object in the warehouse management system, which is a specific
 * area defined by a shape and associated instructions.
 *
 * @param name The name of the zone.
 * @param shapeId The unique identifier for the shape associated with the zone.
 * @param instructions A list of instructions that define how to create or manage the zone.
 */
public record ZoneDataTransferObject(String name, Long shapeId, List<Instruction> instructions) {}
