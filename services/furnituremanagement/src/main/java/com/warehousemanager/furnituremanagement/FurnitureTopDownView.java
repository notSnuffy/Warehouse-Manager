package com.warehousemanager.furnituremanagement;

/**
 * Represents a top-down view of furniture in the warehouse management system.
 *
 * @param id The unique identifier of the furniture.
 * @param shape The shape template that represents the furniture.
 */
public record FurnitureTopDownView(Long id, ShapeInstance shape) {}
