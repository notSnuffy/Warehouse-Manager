package com.warehousemanager.itemmanagement;

/**
 * Data Transfer Object for creating a new Item.
 *
 * @param name Name of the item.
 * @param category Category of the item.
 * @param quantity Quantity of the item.
 * @param description Description of the item.
 */
public record ItemCreateDataTransferObject(
    String name, String category, String quantity, String description) {}
