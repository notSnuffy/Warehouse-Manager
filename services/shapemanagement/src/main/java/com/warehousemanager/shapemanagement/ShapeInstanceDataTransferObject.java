package com.warehousemanager.shapemanagement;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Represents a data transfer object for shape instances in the warehouse management system.
 *
 * @param shapeId The unique identifier for the shape type.
 * @param shapeVersion The version of the shape template used to create this instance.
 * @param instructions A list of instructions that define how to create the shape instance.
 */
public record ShapeInstanceDataTransferObject(
    UUID shapeId, Instant shapeVersion, List<Instruction> instructions) {}
