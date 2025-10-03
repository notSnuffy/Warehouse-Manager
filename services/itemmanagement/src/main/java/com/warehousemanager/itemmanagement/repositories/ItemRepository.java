package com.warehousemanager.itemmanagement.repositories;

import com.warehousemanager.itemmanagement.entities.Item;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

/**
 * Repository interface for managing Item entities. This interface extends CrudRepository to provide
 * basic CRUD operations.
 */
public interface ItemRepository extends CrudRepository<Item, Long> {
  /**
   * Retrieves the next available ID for a new item.
   *
   * @return the next available item ID as a Long
   */
  @Query(value = "SELECT nextval('items_id_seq')", nativeQuery = true)
  Long getNextId();

  /**
   * Finds all items that are not deleted and are marked as current.
   *
   * @return an iterable collection of items that are not deleted and current
   */
  List<Item> findByDeletedFalseAndCurrentTrue();

  /**
   * Finds all items with the specified parent ID that are not deleted and are marked as current.
   *
   * @param parentId the parent ID to search for
   * @return a list of items that match the given parent ID, are not deleted, and are current
   */
  List<Item> findByParentIdEqualsAndDeletedFalseAndCurrentTrue(Long parentId);

  /**
   * Finds all items with the specified IDs that are marked as current.
   *
   * @param ids the list of item IDs to search for
   * @return a list of items that match the given IDs, are not deleted, and are current
   */
  List<Item> findByIdInAndCurrentTrue(List<Long> ids);

  /**
   * Finds all items with the specified IDs that are not deleted and are marked as current.
   *
   * @param ids the list of item IDs to search for
   * @return a list of items that match the given IDs, are not deleted, and are current
   */
  List<Item> findByIdInAndDeletedFalseAndCurrentTrue(List<Long> ids);

  /**
   * Finds all items by their ID that are not deleted, ordered by version in descending order.
   *
   * @param id the ID of the item to search for
   * @return a list of items that match the given ID, are not deleted, ordered by version descending
   */
  List<Item> findByIdEqualsAndDeletedFalseOrderByVersionDesc(Long id);

  /**
   * Finds an item by its ID that is not deleted and is marked as current.
   *
   * @param id the ID of the item to search for
   * @return an optional containing the item if found, otherwise empty
   */
  Optional<Item> findByIdEqualsAndDeletedFalseAndCurrentTrue(Long id);
}
