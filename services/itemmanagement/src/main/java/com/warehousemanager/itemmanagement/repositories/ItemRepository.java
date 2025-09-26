package com.warehousemanager.itemmanagement.repositories;

import com.warehousemanager.itemmanagement.entities.Item;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;

/**
 * Repository interface for managing Item entities. This interface extends CrudRepository to provide
 * basic CRUD operations.
 */
public interface ItemRepository extends CrudRepository<Item, UUID> {

  /**
   * Finds all items that are not deleted and are marked as current.
   *
   * @return an iterable collection of items that are not deleted and current
   */
  List<Item> findByDeletedFalseAndCurrentTrue();

  /**
   * Finds all items with the specified IDs that are not deleted and are marked as current.
   *
   * @param ids the list of item IDs to search for
   * @return a list of items that match the given IDs, are not deleted, and are current
   */
  List<Item> findByIdInAndDeletedFalseAndCurrentTrue(List<UUID> ids);

  /**
   * Finds all items by their ID that are not deleted, ordered by version in descending order.
   *
   * @param id the ID of the item to search for
   * @return a list of items that match the given ID, are not deleted, ordered by version descending
   */
  List<Item> findByIdEqualsAndDeletedFalseOrderByVersionDesc(UUID id);

  /**
   * Finds an item by its ID that is not deleted and is marked as current.
   *
   * @param id the ID of the item to search for
   * @return an optional containing the item if found, otherwise empty
   */
  Optional<Item> findByIdEqualsAndDeletedFalseAndCurrentTrue(UUID id);
}
