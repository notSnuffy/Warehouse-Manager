package com.warehousemanager.floormanagement.repositories;

import com.warehousemanager.floormanagement.entities.Corner;
import com.warehousemanager.floormanagement.entities.Floor;
import java.util.List;
import org.springframework.data.repository.CrudRepository;

/**
 * Repository interface for managing Corner entities. This interface extends CrudRepository to
 * provide basic CRUD operations.
 */
public interface CornerRepository extends CrudRepository<Corner, Long> {
  public List<Corner> findByFloor(Floor floor);
}
