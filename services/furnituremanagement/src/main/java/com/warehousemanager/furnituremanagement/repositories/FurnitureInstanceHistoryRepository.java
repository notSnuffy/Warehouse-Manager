package com.warehousemanager.furnituremanagement.repositories;

import com.warehousemanager.furnituremanagement.entities.FurnitureInstanceHistory;
import org.springframework.data.repository.CrudRepository;

/**
 * Repository interface for managing FurnitureInstanceHistory entities. This interface extends
 * CrudRepository to provide basic CRUD operations.
 */
public interface FurnitureInstanceHistoryRepository
    extends CrudRepository<FurnitureInstanceHistory, Long> {}
