package com.warehousemanager.shapemanagement;

import java.time.Instant;
import java.util.UUID;

/**
 * Represents a unique identifier for a shape, including its version.
 *
 * @param id The unique identifier for the shape.
 * @param version The version of the shape.
 */
public record ShapeId(UUID id, Instant version) {}
