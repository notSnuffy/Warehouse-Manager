package com.warehousemanager.furnituremanagement;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Represents a shape type in the furniture management system. */
public record ShapeType(
    Long id,
    Long version,
    String name,
    String type,
    boolean deleted,
    @JsonProperty("public") boolean isPublic) {}
