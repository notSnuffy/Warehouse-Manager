package com.warehousemanager.furnituremanagement.repositories;

import com.warehousemanager.furnituremanagement.entities.FurnitureInstance;
import org.springframework.data.repository.CrudRepository;

/**
 * Repository interface for managing FurnitureInstance entities. This interface extends
 * CrudRepository to provide basic CRUD operations.
 */
public interface FurnitureInstanceRepository extends CrudRepository<FurnitureInstance, Long> {}
