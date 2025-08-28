package com.warehousemanager.itemmanagement.controller;

import com.warehousemanager.itemmanagement.ItemResponseDataTransferObject;
import com.warehousemanager.itemmanagement.MoveItemRequest;
import com.warehousemanager.itemmanagement.ZoneMoveItemRequest;
import com.warehousemanager.itemmanagement.entities.Item;
import com.warehousemanager.itemmanagement.repositories.ItemRepository;
import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

@RestController
public class ItemManagementController {
  private final DiscoveryClient discoveryClient;
  private final RestClient restClient;
  private final ItemRepository itemRepository;
  private final Logger logger = LoggerFactory.getLogger(ItemManagementController.class);

  public ItemManagementController(
      ItemRepository itemRepository,
      DiscoveryClient discoveryClient,
      RestClient.Builder restClientBuilder) {
    this.discoveryClient = discoveryClient;
    this.restClient = restClientBuilder.build();
    this.itemRepository = itemRepository;
  }

  @GetMapping("/items")
  public List<ItemResponseDataTransferObject> getAllItems() {
    Iterable<Item> items = itemRepository.findAll();
    List<ItemResponseDataTransferObject> itemResponseDataTransferObjects = new ArrayList<>();
    for (Item item : items) {
      ItemResponseDataTransferObject dto = convertToDto(item);
      itemResponseDataTransferObjects.add(dto);
    }
    return itemResponseDataTransferObjects;
  }

  @GetMapping("/items/batch")
  public Map<Long, ItemResponseDataTransferObject> getItemsByIds(@RequestParam List<Long> itemIds) {
    Iterable<Item> items = itemRepository.findAllById(itemIds);
    Map<Long, ItemResponseDataTransferObject> itemMap = new HashMap<>();
    for (Item item : items) {
      ItemResponseDataTransferObject dto = convertToDto(item);
      itemMap.put(item.getId(), dto);
    }
    return itemMap;
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

  /**
   * Converts an Item entity to an ItemResponseDataTransferObject.
   *
   * @param item the Item entity to convert
   * @return the corresponding ItemResponseDataTransferObject
   */
  private ItemResponseDataTransferObject convertToDto(Item item) {
    Long parentId = (item.getParent() != null) ? item.getParent().getId() : null;
    return new ItemResponseDataTransferObject(
        item.getId(),
        item.getName(),
        item.getDescription(),
        item.getCategory(),
        item.getQuantity(),
        item.getFloorId(),
        item.getZoneId(),
        parentId,
        item.getChildren().stream().map(this::convertToDto).toList());
  }

  /**
   * Moves a child item to a new parent item.
   *
   * @param childItem the child item to be moved
   * @param newParentItem the new parent item
   */
  @Transactional
  private void moveChildToNewParent(Item childItem, Item newParentItem) {
    Item oldParentItem = childItem.getParent();
    if (oldParentItem != null) {
      oldParentItem.removeChild(childItem);
    }

    newParentItem.addChild(childItem);
  }

  @Transactional
  @PostMapping("/items/move/batch")
  public void moveItem(@RequestBody List<MoveItemRequest> requests) {
    ServiceInstance serviceInstance = discoveryClient.getInstances("furniture-management").get(0);
    String url = serviceInstance.getUri() + "/furniture/zones/instances/moveItem/batch";
    List<ZoneMoveItemRequest> zoneRequests = new ArrayList<>();
    for (MoveItemRequest request : requests) {
      Long itemId = request.itemId();
      Item item =
          itemRepository
              .findById(itemId)
              .orElseThrow(() -> new IllegalArgumentException("Child item not found"));

      Long oldZoneId = item.getZoneId();
      Long newZoneId = request.newZoneId();
      ZoneMoveItemRequest zoneRequest = new ZoneMoveItemRequest(itemId, oldZoneId, newZoneId);
      zoneRequests.add(zoneRequest);

      item.setZoneId(newZoneId);
      Long newFloorId = request.newFloorId();
      item.setFloorId(newFloorId);

      Long newParentId = request.newParentId();
      Item newParentItem =
          newParentId != null ? itemRepository.findById(newParentId).orElse(null) : null;
      if (newParentItem != null) {
        moveChildToNewParent(item, newParentItem);
      } else {
        Item oldParentItem = item.getParent();
        if (oldParentItem != null) {
          oldParentItem.removeChild(item);
          item.setParent(null);
        }
      }
    }
    logger.info("Sending zone move requests: {}", zoneRequests);
    restClient.post().uri(url).body(zoneRequests).retrieve().body(Void.class);
  }

  @PostMapping("/items")
  public ItemResponseDataTransferObject createItem(@Valid @RequestBody Item item) {
    Item savedItem = itemRepository.save(item);
    return convertToDto(savedItem);
  }

  @PutMapping("/items/{id}")
  public Item updateItem(@PathVariable Long id, @Valid @RequestBody Item item) {
    if (!itemRepository.existsById(id)) {
      throw new IllegalArgumentException("Item not found");
    }
    return itemRepository.save(item);
  }
}
