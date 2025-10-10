package com.warehousemanager.floormanagement;

import java.util.List;

/**
 * Data Transfer Object (DTO) for updating Furniture entity.
 *
 * @param furnitureId The unique identifier for the furniture.
 * @param shapeId The unique identifier for the shape associated with the furniture.
 * @param instructions A list of instructions that define how to create or update the furniture.
 * @param furnitureInstanceId The unique identifier for the specific instance of the furniture on
 *     the floor.
 */
public record FurnitureUpdateQueryDataTransferObject(
    Long furnitureId, Long shapeId, List<Instruction> instructions, Long furnitureInstanceId) {}
