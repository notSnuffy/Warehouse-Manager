package com.warehousemanager.floormanagement.repositories;

import com.warehousemanager.floormanagement.entities.Floor;
import com.warehousemanager.floormanagement.entities.Wall;
import java.util.List;
import org.springframework.data.repository.CrudRepository;

/**
 * Repository interface for managing Wall entities. This interface extends CrudRepository to provide
 * basic CRUD operations.
 */
public interface WallRepository extends CrudRepository<Wall, Long> {
  public List<Wall> findByFloor(Floor floor);
}
