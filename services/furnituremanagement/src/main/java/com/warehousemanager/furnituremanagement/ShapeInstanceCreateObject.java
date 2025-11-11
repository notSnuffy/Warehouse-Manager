package com.warehousemanager.furnituremanagement;

import java.time.Instant;
import java.util.List;

/**
 * Represents a data transfer object for creating a shape instance.
 *
 * @param shapeId The unique identifier for the shape.
 * @param shapeVersion The version of the shape template used to create this instance.
 * @param instructions A string containing instructions that define how to create the shape
 *     instance.
 */
public record ShapeInstanceCreateObject(
    Long shapeId, Instant shapeVersion, List<Instruction> instructions) {}
