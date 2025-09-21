package com.warehousemanager.shapemanagement.repositories;

import com.warehousemanager.shapemanagement.entities.Shape;
import org.springframework.data.repository.CrudRepository;

/**
 * Repository interface for managing Shape entities. This interface extends CrudRepository to
 * provide basic CRUD operations.
 */
public interface ShapeRepository extends CrudRepository<Shape, Long> {}
