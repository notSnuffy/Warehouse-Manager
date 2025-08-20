package com.warehousemanager.floormanagement;

import java.util.List;

/**
 * Data Transfer Object (DTO) for Floor entity.
 *
 * @param name The name of the floor.
 * @param corners A list of corner data transfer objects representing the corners of the floor.
 * @param walls A list of wall data transfer objects representing the walls of the floor.
 * @param furniture A list of furniture query data transfer objects representing the furniture on
 *     the floor.
 */
public record FloorDataTransferObject(
    String name,
    List<CornerDataTransferObject> corners,
    List<WallDataTransferObject> walls,
    List<FurnitureQueryDataTransferObject> furniture) {}
