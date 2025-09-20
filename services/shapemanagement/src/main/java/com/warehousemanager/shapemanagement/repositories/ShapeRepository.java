package com.warehousemanager.shapemanagement.repositories;

import com.warehousemanager.shapemanagement.entities.Shape;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;

/**
 * Repository interface for managing Shape entities. This interface extends CrudRepository to
 * provide basic CRUD operations.
 */
public interface ShapeRepository extends CrudRepository<Shape, Long> {
  /**
   * Finds a Shape entity by its ID and version.
   *
   * @param shapeId the unique identifier of the shape
   * @param version the version of the shape
   * @return an Optional containing the found Shape entity, or empty if not found
   */
  Optional<Shape> findByShapeIdAndVersion(Long shapeId, Long version);
}
