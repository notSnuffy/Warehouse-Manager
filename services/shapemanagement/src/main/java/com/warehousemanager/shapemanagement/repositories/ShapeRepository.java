package com.warehousemanager.shapemanagement.repositories;

import com.warehousemanager.shapemanagement.entities.Shape;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;

/**
 * Repository interface for managing Shape entities. This interface extends CrudRepository to
 * provide basic CRUD operations.
 */
public interface ShapeRepository extends CrudRepository<Shape, UUID> {

  /**
   * Finds all shapes that are marked as current and not deleted.
   *
   * @return a list of shapes that are current and not deleted
   */
  List<Shape> findByCurrentTrueAndDeletedFalse();

  /**
   * Finds all shapes by their ID that are not deleted, ordered by version in descending order.
   *
   * @param id the ID of the shape to search for
   * @return a list of shapes that match the given ID, are not deleted, ordered by version
   *     descending
   */
  List<Shape> findByIdEqualsAndDeletedFalseOrderByVersionDesc(UUID id);

  /**
   * Finds a shape by its ID that is not deleted and is marked as current.
   *
   * @param id the ID of the shape to search for
   * @return an optional containing the shape if found, otherwise empty
   */
  Optional<Shape> findByIdEqualsAndDeletedFalseAndCurrentTrue(UUID id);
}
