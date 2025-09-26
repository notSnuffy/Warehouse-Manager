package com.warehousemanager.itemmanagement;

import java.time.Instant;
import java.util.UUID;

/**
 * Composite key class for Item entity, consisting of id and version.
 *
 * @param id Unique identifier for the item.
 * @param version Version timestamp.
 */
public record ItemId(UUID id, Instant version) {}
