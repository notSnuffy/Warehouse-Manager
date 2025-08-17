package com.warehousemanager.furnituremanagement;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Represents a shape type in the furniture management system. */
public record ShapeType(
    Long id, String name, String type, @JsonProperty("public") boolean isPublic, boolean visible) {}
