package com.warehousemanager.furnituremanagement.repositories;

import com.warehousemanager.furnituremanagement.entities.Zone;
import org.springframework.data.repository.CrudRepository;

/**
 * Repository interface for managing Zone entities. This interface extends CrudRepository to provide
 * basic CRUD operations.
 */
public interface ZoneRepository extends CrudRepository<Zone, Long> {}
