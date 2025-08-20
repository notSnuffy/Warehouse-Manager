package com.warehousemanager.furnituremanagement;

import java.util.List;

/**
 * Represents a data transfer object for creating a shape instance.
 *
 * @param shapeId The unique identifier for the shape.
 * @param instructions A string containing instructions that define how to create the shape
 *     instance.
 */
public record ShapeInstanceCreateObject(Long shapeId, List<Instruction> instructions) {}
