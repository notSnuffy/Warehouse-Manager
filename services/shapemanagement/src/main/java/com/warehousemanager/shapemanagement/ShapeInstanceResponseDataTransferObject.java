package com.warehousemanager.shapemanagement;

import com.warehousemanager.shapemanagement.entities.Shape;
import java.time.Instant;
import java.util.List;

/**
 * Represents a data transfer object for shape instance responses in the warehouse management
 * system.
 *
 * @param id The unique identifier for the shape instance.
 * @param shape The shape entity associated with this instance.
 * @param shapeVersion The version of the shape template used to create this instance.
 * @param isTemplate Indicates whether this shape instance is a template.
 * @param instructions A list of instructions that define how to create the shape instance.
 */
public record ShapeInstanceResponseDataTransferObject(
    Long id,
    Shape shape,
    Instant shapeVersion,
    boolean isTemplate,
    List<Instruction> instructions) {}
