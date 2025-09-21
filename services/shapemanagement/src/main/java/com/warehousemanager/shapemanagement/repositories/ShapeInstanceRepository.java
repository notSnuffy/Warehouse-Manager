package com.warehousemanager.shapemanagement.repositories;

import com.warehousemanager.shapemanagement.entities.ShapeInstance;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

/**
 * Repository interface for managing ShapeComponent entities. This interface extends CrudRepository
 * to provide basic CRUD operations.
 */
public interface ShapeInstanceRepository extends CrudRepository<ShapeInstance, Long> {

  @Query(
      """
      SELECT si FROM ShapeInstance si
      WHERE si.shape.id = :shapeId AND si.isTemplate = true
      AND si.shapeVersion = si.shape.version
      """)
  Optional<ShapeInstance> findLatestTemplateByShapeId(@Param("shapeId") Long shapeId);
}
