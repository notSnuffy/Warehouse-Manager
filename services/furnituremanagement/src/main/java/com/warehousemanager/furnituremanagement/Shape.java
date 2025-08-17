package com.warehousemanager.furnituremanagement;

import java.util.List;

/**
 * Represents a shape transfer object in the warehouse management system.
 *
 * @param shapeId The unique identifier for the shape type.
 * @param instructions A list of instructions that define how to create the shape.
 */
public record Shape(Long shapeId, List<Instruction> instructions) {}
