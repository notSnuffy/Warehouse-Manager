package com.warehousemanager.furnituremanagement;

import java.time.Instant;

/**
 * Represents a unique identifier for a furniture, including its version.
 *
 * @param id The unique identifier for the furniture.
 * @param version The version of the furniture.
 */
public record FurnitureId(Long id, Instant version) {}
