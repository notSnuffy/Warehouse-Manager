package com.warehousemanager.itemmanagement;

import java.time.Instant;

/**
 * Composite key class for Item entity, consisting of id and version.
 *
 * @param id Unique identifier for the item.
 * @param version Version timestamp.
 */
public record ItemId(Long id, Instant version) {}
