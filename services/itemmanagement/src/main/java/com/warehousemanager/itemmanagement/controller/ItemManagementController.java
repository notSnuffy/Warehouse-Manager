package com.warehousemanager.itemmanagement.controller;

import com.warehousemanager.itemmanagement.ItemCreateDataTransferObject;
import com.warehousemanager.itemmanagement.ItemResponseDataTransferObject;
import com.warehousemanager.itemmanagement.MoveItemRequest;
import com.warehousemanager.itemmanagement.ZoneMoveItemRequest;
import com.warehousemanager.itemmanagement.entities.Item;
import com.warehousemanager.itemmanagement.repositories.ItemRepository;
import com.warehousemanager.itemmanagement.services.ItemService;
import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
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

  private final ItemService itemService;

  public ItemManagementController(
      ItemRepository itemRepository,
      DiscoveryClient discoveryClient,
      RestClient.Builder restClientBuilder,
      ItemService itemService) {

    this.discoveryClient = discoveryClient;
    this.restClient = restClientBuilder.build();
    this.itemRepository = itemRepository;
    this.itemService = itemService;
  }

  @GetMapping("/items")
  public List<ItemResponseDataTransferObject> getAllItems() {
    List<Item> items = itemRepository.findByDeletedFalseAndCurrentTrue();
    List<ItemResponseDataTransferObject> itemResponseDataTransferObjects = new ArrayList<>();
    for (Item item : items) {
      ItemResponseDataTransferObject dto = itemService.convertToDto(item);
      itemResponseDataTransferObjects.add(dto);
    }
    return itemResponseDataTransferObjects;
  }

  @GetMapping("/items/batch")
  public Map<Long, ItemResponseDataTransferObject> getItemsByIds(@RequestParam List<Long> itemIds) {
    List<Item> items = itemRepository.findByIdInAndCurrentTrue(itemIds);
    Map<Long, ItemResponseDataTransferObject> itemMap = new HashMap<>();
    for (Item item : items) {
      ItemResponseDataTransferObject dto = itemService.convertToDto(item);
      itemMap.put(item.getId(), dto);
    }
    return itemMap;
  }

  @GetMapping("/items/{id}")
  public ItemResponseDataTransferObject getItemById(@PathVariable Long id) {
    Item item = itemRepository.findByIdEqualsAndDeletedFalseAndCurrentTrue(id).orElse(null);
    if (item == null) {
      throw new IllegalArgumentException("Item not found");
    }
    return itemService.convertToDto(item);
  }

  @GetMapping("/items/parent/{childId}")
  public ItemResponseDataTransferObject getParentItemByChildId(@PathVariable Long childId) {
    Item childItem =
        itemRepository
            .findByIdEqualsAndDeletedFalseAndCurrentTrue(childId)
            .orElseThrow(() -> new IllegalArgumentException("Child item not found"));
    Item parentItem =
        itemRepository
            .findByIdEqualsAndDeletedFalseAndCurrentTrue(childItem.getParentId())
            .orElse(null);
    if (parentItem == null) {
      logger.warn("Parent item not found for child ID: {}", childId);
      throw new IllegalArgumentException("Parent item not found");
    }
    return itemService.convertToDto(parentItem);
  }

  @GetMapping("/items/children/{parentId}")
  public Iterable<ItemResponseDataTransferObject> getChildItemsByParentId(
      @PathVariable Long parentId) {
    itemRepository
        .findByIdEqualsAndDeletedFalseAndCurrentTrue(parentId)
        .orElseThrow(() -> new IllegalArgumentException("Parent item not found"));
    List<ItemResponseDataTransferObject> childDtos =
        itemService.getItemChildren(parentId).stream().map(itemService::convertToDto).toList();
    return childDtos;
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
              .findByIdEqualsAndDeletedFalseAndCurrentTrue(itemId)
              .orElseThrow(() -> new IllegalArgumentException("Item not found: " + itemId));

      Item newItem = new Item(item);
      newItem = itemRepository.save(newItem);
      item.setCurrent(false);

      Long oldZoneId = item.getZoneId();
      Long newZoneId = request.newZoneId();
      ZoneMoveItemRequest zoneRequest = new ZoneMoveItemRequest(itemId, oldZoneId, newZoneId);
      zoneRequests.add(zoneRequest);

      newItem.setZoneId(newZoneId);
      Long newFloorId = request.newFloorId();
      newItem.setFloorId(newFloorId);

      Long newParentId = request.newParentId();
      Item newParentItem =
          newParentId != null
              ? itemRepository.findByIdEqualsAndDeletedFalseAndCurrentTrue(newParentId).orElse(null)
              : null;
      if (newParentItem != null) {
        itemService.moveChildToNewParent(newItem, newParentItem);
      } else {
        newItem.setParentId(null);
      }
    }
    logger.info("Sending zone move requests: {}", zoneRequests);
    restClient.post().uri(url).body(zoneRequests).retrieve().body(Void.class);
  }

  @PostMapping("/items")
  public ItemResponseDataTransferObject createItem(@RequestBody ItemCreateDataTransferObject item) {
    logger.info("Creating item: {}", item);
    Long nextId = itemRepository.getNextId();
    logger.info("Next item ID: {}", nextId);
    Item newItem = new Item(nextId, item.name());
    newItem.setDescription(item.description());
    newItem.setCategory(item.category());
    newItem.setQuantity(item.quantity());
    Item savedItem = itemRepository.save(newItem);
    return itemService.convertToDto(savedItem);
  }

  @PutMapping("/items/{id}")
  public ItemResponseDataTransferObject updateItem(
      @PathVariable Long id, @Valid @RequestBody Item item) {
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

    itemRepository.save(existingItem);

    return itemService.convertToDto(newItem);
  }

  @DeleteMapping("/items/{id}")
  public Set<Long> deleteItem(@PathVariable Long id) {
    List<Item> items = itemRepository.findByIdEqualsAndDeletedFalseOrderByVersionDesc(id);

    if (items.size() == 0) {
      throw new IllegalArgumentException("Item not found");
    }

    Set<Long> visitedIds = new HashSet<>();
    for (Item item : items) {
      itemService.deleteChildren(item, visitedIds);

      item.setDeleted(true);
      itemRepository.save(item);
    }
    return visitedIds;
  }
}
