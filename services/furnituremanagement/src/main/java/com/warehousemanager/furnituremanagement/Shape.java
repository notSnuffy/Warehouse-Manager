package com.warehousemanager.furnituremanagement;

import java.time.Instant;
import java.util.List;

/**
 * Represents a shape transfer object in the warehouse management system.
 *
 * @param shapeId The unique identifier for the shape type.
 * @param shapeVersion The version of the shape.
 * @param instructions A list of instructions that define how to create the shape.
 */
public record Shape(Long shapeId, Instant shapeVersion, List<Instruction> instructions) {}
