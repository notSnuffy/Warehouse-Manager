package com.warehousemanager.itemmanagement.controller;

import com.warehousemanager.itemmanagement.ItemResponseDataTransferObject;
import com.warehousemanager.itemmanagement.MoveItemRequest;
import com.warehousemanager.itemmanagement.ZoneMoveItemRequest;
import com.warehousemanager.itemmanagement.entities.Item;
import com.warehousemanager.itemmanagement.repositories.ItemRepository;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
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
    List<Item> items = itemRepository.findByDeletedFalseAndCurrentTrue();
    List<ItemResponseDataTransferObject> itemResponseDataTransferObjects = new ArrayList<>();
    for (Item item : items) {
      ItemResponseDataTransferObject dto = convertToDto(item);
      itemResponseDataTransferObjects.add(dto);
    }
    return itemResponseDataTransferObjects;
  }

  @GetMapping("/items/batch")
  public Map<UUID, ItemResponseDataTransferObject> getItemsByIds(@RequestParam List<UUID> itemIds) {
    List<Item> items = itemRepository.findByIdInAndDeletedFalseAndCurrentTrue(itemIds);
    Map<UUID, ItemResponseDataTransferObject> itemMap = new HashMap<>();
    for (Item item : items) {
      ItemResponseDataTransferObject dto = convertToDto(item);
      itemMap.put(item.getId(), dto);
    }
    return itemMap;
  }

  @GetMapping("/items/{id}")
  public ItemResponseDataTransferObject getItemById(@PathVariable UUID id) {
    Item item = itemRepository.findByIdEqualsAndDeletedFalseAndCurrentTrue(id).orElse(null);
    if (item == null) {
      throw new IllegalArgumentException("Item not found");
    }
    return convertToDto(item);
  }

  @GetMapping("/items/parent/{childId}")
  public ItemResponseDataTransferObject getParentItemByChildId(@PathVariable UUID childId) {
    Item childItem =
        itemRepository
            .findByIdEqualsAndDeletedFalseAndCurrentTrue(childId)
            .orElseThrow(() -> new IllegalArgumentException("Child item not found"));
    Item parentItem = childItem.getParent();
    if (parentItem == null) {
      logger.warn("Parent item not found for child ID: {}", childId);
      throw new IllegalArgumentException("Parent item not found");
    }
    return convertToDto(parentItem);
  }

  @GetMapping("/items/children/{parentId}")
  public Iterable<ItemResponseDataTransferObject> getChildItemsByParentId(
      @PathVariable UUID parentId) {
    Item parentItem =
        itemRepository
            .findByIdEqualsAndDeletedFalseAndCurrentTrue(parentId)
            .orElseThrow(() -> new IllegalArgumentException("Parent item not found"));
    List<ItemResponseDataTransferObject> childDtos = new ArrayList<>();
    for (Item child : parentItem.getChildren()) {
      childDtos.add(convertToDto(child));
    }
    return childDtos;
  }

  /**
   * Converts an Item entity to an ItemResponseDataTransferObject.
   *
   * @param item the Item entity to convert
   * @return the corresponding ItemResponseDataTransferObject
   */
  private ItemResponseDataTransferObject convertToDto(Item item) {
    UUID parentId = (item.getParent() != null) ? item.getParent().getId() : null;
    Instant parentVersion = (item.getParent() != null) ? item.getParent().getVersion() : null;
    return new ItemResponseDataTransferObject(
        item.getId(),
        item.getVersion(),
        item.getDeleted(),
        item.getName(),
        item.getDescription(),
        item.getCategory(),
        item.getQuantity(),
        item.getFloorId(),
        item.getZoneId(),
        parentId,
        parentVersion,
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
      UUID itemId = request.itemId();
      Item item =
          itemRepository
              .findByIdEqualsAndDeletedFalseAndCurrentTrue(itemId)
              .orElseThrow(() -> new IllegalArgumentException("Item not found: " + itemId));

      Item newItem = new Item(item);
      newItem = itemRepository.save(newItem);
      item.setCurrent(false);
      Item oldParent = item.getParent();
      if (oldParent != null) {
        oldParent.removeChild(item);
      }
      for (Item child : item.getChildren()) {
        child.setParent(newItem);
      }

      Long oldZoneId = item.getZoneId();
      Long newZoneId = request.newZoneId();
      ZoneMoveItemRequest zoneRequest = new ZoneMoveItemRequest(itemId, oldZoneId, newZoneId);
      zoneRequests.add(zoneRequest);

      newItem.setZoneId(newZoneId);
      Long newFloorId = request.newFloorId();
      newItem.setFloorId(newFloorId);

      UUID newParentId = request.newParentId();
      Item newParentItem =
          newParentId != null
              ? itemRepository.findByIdEqualsAndDeletedFalseAndCurrentTrue(newParentId).orElse(null)
              : null;
      if (newParentItem != null) {
        moveChildToNewParent(newItem, newParentItem);
      } else {
        Item oldParentItem = newItem.getParent();
        if (oldParentItem != null) {
          oldParentItem.removeChild(item);
          newItem.setParent(null);
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
  public ItemResponseDataTransferObject updateItem(
      @PathVariable UUID id, @Valid @RequestBody Item item) {
    Item existingItem = itemRepository.findByIdEqualsAndDeletedFalseAndCurrentTrue(id).orElse(null);
    if (existingItem == null) {
      throw new IllegalArgumentException("Item not found");
    }
    Item newItem = new Item(existingItem);
    newItem.setName(item.getName());
    newItem.setDescription(item.getDescription());
    newItem.setCategory(item.getCategory());
    newItem.setQuantity(item.getQuantity());

    newItem = itemRepository.save(newItem);
    existingItem.setCurrent(false);
    Item oldParent = existingItem.getParent();
    if (oldParent != null) {
      oldParent.removeChild(existingItem);
    }

    for (Item child : existingItem.getChildren()) {
      child.setParent(newItem);
      itemRepository.save(child);
    }
    itemRepository.save(existingItem);

    return convertToDto(newItem);
  }

  public void resetChildrenLocation(Item item) {
    for (Item child : item.getChildren()) {
      child.setDeleted(true);
      child.setFloorId(null);
      child.setZoneId(null);
      itemRepository.save(child);
      resetChildrenLocation(child);
    }
  }

  @DeleteMapping("/items/{id}")
  public void deleteItem(@PathVariable UUID id) {
    List<Item> items = itemRepository.findByIdEqualsAndDeletedFalseOrderByVersionDesc(id);

    if (items.size() == 0) {
      throw new IllegalArgumentException("Item not found");
    }

    for (Item item : items) {
      Item parentItem = item.getParent();
      if (parentItem != null) {
        parentItem.removeChild(item);
      }

      for (Item child : item.getChildren()) {
        child.setParent(null);
        child.setFloorId(null);
        child.setZoneId(null);
        child.setDeleted(true);
        resetChildrenLocation(child);
        itemRepository.save(child);
      }

      item.setDeleted(true);
      itemRepository.save(item);
    }
  }
}
