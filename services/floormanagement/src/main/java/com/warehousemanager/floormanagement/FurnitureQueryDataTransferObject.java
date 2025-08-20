package com.warehousemanager.floormanagement;

import java.util.List;

/**
 * Data Transfer Object (DTO) for Furniture entity.
 *
 * @param furnitureId The unique identifier for the furniture.
 * @param shapeId The unique identifier for the shape associated with the furniture.
 * @param instructions A list of instructions that define how to create the furniture.
 */
public record FurnitureQueryDataTransferObject(
    Long furnitureId, Long shapeId, List<Instruction> instructions) {}
