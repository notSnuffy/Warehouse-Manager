package com.warehousemanager.furnituremanagement;

import java.util.List;

/**
 * Data Transfer Object (DTO) for creating a furniture instance.
 *
 * @param furnitureId The unique identifier for the furniture.
 * @param shapeId The unique identifier for the shape associated with the furniture.
 * @param instructions A list of instructions that define how to create the furniture instance.
 */
public record FurnitureInstanceCreateDataTransferObject(
    Long furnitureId, Long shapeId, List<Instruction> instructions) {}
