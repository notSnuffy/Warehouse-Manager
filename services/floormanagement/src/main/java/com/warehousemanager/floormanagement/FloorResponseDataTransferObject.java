package com.warehousemanager.floormanagement;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;

/**
 * Response Data Transfer Object (DTO) for Floor entity.
 *
 * @param id The unique identifier for the floor.
 * @param name The name of the floor.
 * @param corners A list of corner data transfer objects representing the corners of the floor.
 * @param walls A list of wall data transfer objects representing the walls of the floor.
 * @param furniture A string representing the furniture instances associated with the floor.
 */
public record FloorResponseDataTransferObject(
    Long id,
    String name,
    List<CornerDataTransferObject> corners,
    List<WallDataTransferObject> walls,
    JsonNode furniture) {}
