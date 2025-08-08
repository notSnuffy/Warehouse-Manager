package com.warehousemanager.floormanagement.repositories;

import com.warehousemanager.floormanagement.entities.Floor;
import org.springframework.data.repository.CrudRepository;

/**
 * Repository interface for managing Floor entities. This interface extends CrudRepository to
 * provide basic CRUD operations.
 */
public interface FloorRepository extends CrudRepository<Floor, Long> {}
