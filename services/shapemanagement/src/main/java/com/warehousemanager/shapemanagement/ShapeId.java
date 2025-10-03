package com.warehousemanager.shapemanagement;

import java.time.Instant;

/**
 * Represents a unique identifier for a shape, including its version.
 *
 * @param id The unique identifier for the shape.
 * @param version The version of the shape.
 */
public record ShapeId(Long id, Instant version) {}
