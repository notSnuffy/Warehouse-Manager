package com.warehousemanager.floormanagement.repositories;

import com.warehousemanager.floormanagement.entities.Floor;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

/**
 * Repository interface for managing Floor entities. This interface extends CrudRepository to
 * provide basic CRUD operations.
 */
public interface FloorRepository extends CrudRepository<Floor, Long> {
  /**
   * Retrieves the next available ID for a new floor.
   *
   * @return the next available floor ID as a Long
   */
  @Query(value = "SELECT nextval('floor_id_seq')", nativeQuery = true)
  Long getNextId();

  /**
   * Finds all floors that are not deleted and are marked as current.
   *
   * @return an iterable collection of floors that are not deleted and current
   */
  List<Floor> findByDeletedFalseAndCurrentTrue();

  /**
   * Finds all floors with the specified IDs that are not deleted and are marked as current.
   *
   * @param ids the list of floor IDs to search for
   * @return a list of floors that match the given IDs, are not deleted, and are current
   */
  List<Floor> findByIdInAndDeletedFalseAndCurrentTrue(List<Long> ids);

  /**
   * Finds all floors by their ID that are not deleted, ordered by version in descending order.
   *
   * @param id the ID of the floor to search for
   * @return a list of floors that match the given ID, are not deleted, ordered by version
   *     descending
   */
  List<Floor> findByIdEqualsAndDeletedFalseOrderByVersionDesc(Long id);

  /**
   * Finds a floor by its ID that is not deleted and is marked as current.
   *
   * @param id the ID of the floor to search for
   * @return an optional containing the floor if found, otherwise empty
   */
  Optional<Floor> findByIdEqualsAndDeletedFalseAndCurrentTrue(Long id);
}
