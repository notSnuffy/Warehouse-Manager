package com.warehousemanager.shapemanagement.repositories;

import com.warehousemanager.shapemanagement.entities.ShapeInstance;
import org.springframework.data.repository.CrudRepository;

/**
 * Repository interface for managing ShapeComponent entities. This interface extends CrudRepository
 * to provide basic CRUD operations.
 */
public interface ShapeInstanceRepository extends CrudRepository<ShapeInstance, Long> {}
