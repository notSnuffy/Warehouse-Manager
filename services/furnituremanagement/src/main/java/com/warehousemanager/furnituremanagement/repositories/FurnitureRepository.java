package com.warehousemanager.furnituremanagement.repositories;

import com.warehousemanager.furnituremanagement.entities.Furniture;
import org.springframework.data.repository.CrudRepository;

/**
 * Repository interface for managing Furniture entities. This interface extends CrudRepository to
 * provide basic CRUD operations.
 */
public interface FurnitureRepository extends CrudRepository<Furniture, Long> {}
