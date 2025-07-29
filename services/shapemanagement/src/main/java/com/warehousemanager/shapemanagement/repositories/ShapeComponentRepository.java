package com.warehousemanager.shapemanagement.repositories;

import com.warehousemanager.shapemanagement.entities.ShapeComponent;
import org.springframework.data.repository.CrudRepository;

/**
 * Repository interface for managing ShapeComponent entities. This interface extends CrudRepository
 * to provide basic CRUD operations.
 */
public interface ShapeComponentRepository extends CrudRepository<ShapeComponent, Long> {}
