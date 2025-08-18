package com.warehousemanager.furnituremanagement;

import java.util.List;

/**
 * Represents a zone response data transfer object in the warehouse management system, which is a
 * specific area defined by a shape and associated instructions.
 *
 * @param id The unique identifier for the zone.
 * @param name The name of the zone.
 * @param shape The type of shape associated with the zone.
 * @param instructions A list of instructions that define how to create the zone.
 */
public record ZoneResponseDataTransferObject(
    Long id, String name, ShapeType shape, List<Instruction> instructions) {}
