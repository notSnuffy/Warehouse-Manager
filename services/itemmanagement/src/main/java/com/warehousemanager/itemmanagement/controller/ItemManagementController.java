package com.warehousemanager.itemmanagement.controller;

import com.warehousemanager.itemmanagement.entities.Item;
import com.warehousemanager.itemmanagement.repositories.ItemRepository;
import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ItemManagementController {
  private final ItemRepository itemRepository;
  private final Logger logger = LoggerFactory.getLogger(ItemManagementController.class);

  public ItemManagementController(ItemRepository itemRepository) {
    this.itemRepository = itemRepository;
  }

  @GetMapping("/items")
  public Iterable<Item> getAllItems() {
    return itemRepository.findAll();
  }

  @GetMapping("/items/{id}")
  public Item getItemById(@PathVariable Long id) {
    return itemRepository.findById(id).orElse(null);
  }

  @GetMapping("/items/parent/{childId}")
  public Item getParentItemByChildId(@PathVariable Long childId) {
    Item parentItem = itemRepository.findParentByChildrenId(childId);
    if (parentItem == null) {
      logger.warn("Parent item not found for child ID: {}", childId);
      throw new IllegalArgumentException("Parent item not found");
    }
    return parentItem;
  }

  @GetMapping("/items/children/{parentId}")
  public Iterable<Item> getChildItemsByParentId(@PathVariable Long parentId) {
    return itemRepository
        .findById(parentId)
        .map(Item::getChildren)
        .orElseThrow(() -> new IllegalArgumentException("Parent item not found"));
  }

  private void getAllSavedItems(Item item, List<Item> allSavedItems) {
    allSavedItems.add(item);
    logger.info("Children of item with ID {}: {}", item.getId(), item.getChildren());
    for (Item child : item.getChildren()) {
      getAllSavedItems(child, allSavedItems);
    }
  }

  @PostMapping("/items")
  public List<Item> createItem(@Valid @RequestBody Item item) {
    Item savedItem = itemRepository.save(item);
    List<Item> allSavedItems = new ArrayList<>();
    getAllSavedItems(savedItem, allSavedItems);
    logger.info(
        "All items saved under the parent item with ID {}: {}", savedItem.getId(), allSavedItems);
    return allSavedItems;
  }

  @PutMapping("/items/{id}")
  public Item updateItem(@PathVariable Long id, @Valid @RequestBody Item item) {
    if (!itemRepository.existsById(id)) {
      throw new IllegalArgumentException("Item not found");
    }
    return itemRepository.save(item);
  }
}
