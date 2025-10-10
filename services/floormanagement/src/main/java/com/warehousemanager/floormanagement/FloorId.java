package com.warehousemanager.floormanagement;

import java.time.Instant;

/**
 * Composite key class for Floor entity, consisting of id and version.
 *
 * @param id Unique identifier for the item.
 * @param version Version timestamp.
 */
public record FloorId(Long id, Instant version) {}
