package com.warehousemanager.itemmanagement.repositories;

import com.warehousemanager.itemmanagement.entities.Item;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

/**
 * Repository interface for managing Item entities. This interface extends CrudRepository to provide
 * basic CRUD operations.
 */
public interface ItemRepository extends CrudRepository<Item, Long> {
  /**
   * Finds the parent Item by the ID of a child Item.
   *
   * @param childId the ID of the child Item
   * @return the parent Item if found, otherwise null
   */
  @Query("SELECT item FROM Item item JOIN item.children child WHERE child.id = :childId")
  Item findParentByChildrenId(Long childId);
}
