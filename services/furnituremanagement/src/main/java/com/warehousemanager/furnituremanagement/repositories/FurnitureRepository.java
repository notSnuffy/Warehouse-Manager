package com.warehousemanager.furnituremanagement.repositories;

import com.warehousemanager.furnituremanagement.entities.Furniture;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

/**
 * Repository interface for managing Furniture entities. This interface extends CrudRepository to
 * provide basic CRUD operations.
 */
public interface FurnitureRepository extends CrudRepository<Furniture, Long> {
  /**
   * Retrieves the next available ID for a new furniture.
   *
   * @return the next available furniture ID as a Long
   */
  @Query(value = "SELECT nextval('furniture_id_seq')", nativeQuery = true)
  Long getNextId();

  /**
   * Finds all furniture that is not deleted and is marked as current.
   *
   * @return an iterable collection of furniture that is not deleted and current
   */
  List<Furniture> findByDeletedFalseAndCurrentTrue();

  /**
   * Finds all furniture with the specified IDs that are not deleted and are marked as current.
   *
   * @param ids the list of furniture IDs to search for
   * @return a list of furniture that matches the given IDs, is not deleted, and is current
   */
  List<Furniture> findByIdInAndDeletedFalseAndCurrentTrue(List<Long> ids);

  /**
   * Finds all furniture by its ID that is not deleted, ordered by version in descending order.
   *
   * @param id the ID of the furniture to search for
   * @return a list of furniture that matches the given ID, is not deleted, ordered by version
   *     descending
   */
  List<Furniture> findByIdEqualsAndDeletedFalseOrderByVersionDesc(Long id);

  /**
   * Finds a furniture by its ID that is not deleted and is marked as current.
   *
   * @param id the ID of the furniture to search for
   * @return an optional containing the furniture if found, otherwise empty
   */
  Optional<Furniture> findByIdEqualsAndDeletedFalseAndCurrentTrue(Long id);
}
