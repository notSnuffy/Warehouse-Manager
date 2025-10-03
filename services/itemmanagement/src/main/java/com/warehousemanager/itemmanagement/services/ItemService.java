package com.warehousemanager.itemmanagement.services;

import com.warehousemanager.itemmanagement.ItemResponseDataTransferObject;
import com.warehousemanager.itemmanagement.entities.Item;
import com.warehousemanager.itemmanagement.repositories.ItemRepository;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Service class for managing items and their hierarchical relationships. */
@Service
public class ItemService {
  // Repository for managing Item entities
  private final ItemRepository itemRepository;

  /**
   * Constructor for ItemService.
   *
   * @param itemRepository the repository for managing Item entities
   */
  public ItemService(ItemRepository itemRepository) {
    this.itemRepository = itemRepository;
  }

  /**
   * Retrieves all child items for a given parent item ID.
   *
   * @param parentId the ID of the parent item
   * @return a list of child items associated with the specified parent ID
   */
  public List<Item> getItemChildren(Long parentId) {
    return itemRepository.findByParentIdEqualsAndDeletedFalseAndCurrentTrue(parentId);
  }

  /**
   * Moves a child item to a new parent item.
   *
   * @param childItem the child item to be moved
   * @param newParentItem the new parent item
   */
  @Transactional
  public void moveChildToNewParent(Item childItem, Item newParentItem) {
    childItem.setParentId(newParentItem.getId());
  }

  /**
   * Converts an Item entity to an ItemResponseDataTransferObject.
   *
   * @param item the Item entity to convert
   * @return the corresponding ItemResponseDataTransferObject
   */
  public ItemResponseDataTransferObject convertToDto(Item item) {
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
        item.getParentId(),
        getItemChildren(item.getId()).stream().map(this::convertToDto).toList());
  }

  /**
   * Recursively marks an item and all its children as deleted. Additionally, it marks all previous
   * versions of each item as deleted.
   *
   * @param item the item to be marked as deleted along with its children
   */
  public void deleteChildren(Item item, Set<Long> visitedIds) {
    if (visitedIds.contains(item.getId())) {
      return;
    }
    visitedIds.add(item.getId());
    for (Item child : getItemChildren(item.getId())) {
      List<Item> childItems =
          itemRepository.findByIdEqualsAndDeletedFalseOrderByVersionDesc(child.getId());
      for (Item childItem : childItems) {
        childItem.setDeleted(true);
        itemRepository.save(childItem);
      }

      deleteChildren(child, visitedIds);
    }
  }
}
