package com.warehousemanager.furnituremanagement;

import java.time.Instant;
import java.util.List;

/**
 * Represents an instance of a shape in the warehouse management system, which includes a unique
 * identifier, the type of shape, a list of instructions for creating, and a flag indicating if it
 * is a template.
 *
 * @param id The unique identifier for the shape instance.
 * @param shapeVersion The version of the shape at the time this instance was created.
 * @param shape The type of shape represented by this instance.
 * @param instructions A list of instructions that define how to create the shape instance.
 * @param template A boolean flag indicating if this shape instance is a template.
 */
public record ShapeInstance(
    Long id,
    Instant shapeVersion,
    ShapeType shape,
    List<Instruction> instructions,
    boolean template) {}
