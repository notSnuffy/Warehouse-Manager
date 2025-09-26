package com.warehousemanager.furnituremanagement;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

/** Represents a shape type in the furniture management system. */
public record ShapeType(
    UUID id,
    Instant version,
    String name,
    String type,
    boolean deleted,
    @JsonProperty("public") boolean isPublic) {}
