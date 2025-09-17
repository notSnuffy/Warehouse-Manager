package com.warehousemanager.itemmanagement;

import java.util.List;

/**
 * Data Transfer Object (DTO) for transferring item response data.
 *
 * @param id the unique identifier of the item
 * @param deleted the deleted status of the item
 * @param name the name of the item
 * @param description the description of the item
 * @param category the category of the item
 * @param quantity the quantity of the item in stock
 * @param floorId the identifier for the floor where the item is stored
 * @param zoneId the identifier for the zone where the item is stored
 * @param parentId the identifier of the parent item, if applicable
 * @param children the list of child items, representing a hierarchical structure
 */
public record ItemResponseDataTransferObject(
    Long id,
    Boolean deleted,
    String name,
    String description,
    String category,
    String quantity,
    Long floorId,
    Long zoneId,
    Long parentId,
    List<ItemResponseDataTransferObject> children) {}
