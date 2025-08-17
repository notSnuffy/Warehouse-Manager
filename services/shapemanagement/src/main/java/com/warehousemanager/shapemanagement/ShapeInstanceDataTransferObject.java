package com.warehousemanager.shapemanagement;

import java.util.List;

/**
 * Represents a data transfer object for shape instances in the warehouse management system.
 *
 * @param shapeId The unique identifier for the shape type.
 * @param instructions A list of instructions that define how to create the shape instance.
 */
public record ShapeInstanceDataTransferObject(Long shapeId, List<Instruction> instructions) {}
