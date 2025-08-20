package com.warehousemanager.furnituremanagement.repositories;

import com.warehousemanager.furnituremanagement.entities.ZoneInstance;
import org.springframework.data.repository.CrudRepository;

/**
 * Repository interface for managing ZoneInstance entities. This interface extends CrudRepository to
 * provide basic CRUD operations.
 */
public interface ZoneInstanceRepository extends CrudRepository<ZoneInstance, Long> {}
