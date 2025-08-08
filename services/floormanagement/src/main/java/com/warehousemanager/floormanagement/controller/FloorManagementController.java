package com.warehousemanager.floormanagement.controller;

import com.warehousemanager.floormanagement.CornerDataTransferObject;
import com.warehousemanager.floormanagement.FloorDataTransferObject;
import com.warehousemanager.floormanagement.WallDataTransferObject;
import com.warehousemanager.floormanagement.entities.Corner;
import com.warehousemanager.floormanagement.entities.Floor;
import com.warehousemanager.floormanagement.entities.Wall;
import com.warehousemanager.floormanagement.repositories.CornerRepository;
import com.warehousemanager.floormanagement.repositories.FloorRepository;
import com.warehousemanager.floormanagement.repositories.WallRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FloorManagementController {
  private final FloorRepository floorRepository;
  private final WallRepository wallRepository;
  private final CornerRepository cornerRepository;
  private static final Logger logger = LoggerFactory.getLogger(FloorManagementController.class);

  public FloorManagementController(
      FloorRepository floorRepository,
      WallRepository wallRepository,
      CornerRepository cornerRepository) {
    this.floorRepository = floorRepository;
    this.wallRepository = wallRepository;
    this.cornerRepository = cornerRepository;
  }

  @GetMapping("/floors")
  public Iterable<Floor> getAllFloors() {
    return floorRepository.findAll();
  }

  @PostMapping("/floors")
  public Floor saveFloor(@RequestBody FloorDataTransferObject floorDataTransferObject) {
    Floor floor = new Floor(floorDataTransferObject.name);
    floor = floorRepository.save(floor);

    Map<Long, Corner> corners = new HashMap<>();

    for (CornerDataTransferObject cornerDataTransferObject : floorDataTransferObject.corners) {
      Corner corner =
          new Corner(cornerDataTransferObject.positionX, cornerDataTransferObject.positionY);
      corner.setFloor(floor);
      corner = cornerRepository.save(corner);
      corners.put(cornerDataTransferObject.id, corner);
    }

    for (WallDataTransferObject wallDataTransferObject : floorDataTransferObject.walls) {
      Corner startCorner = corners.get(wallDataTransferObject.startCornerId);
      Corner endCorner = corners.get(wallDataTransferObject.endCornerId);

      if (startCorner == null || endCorner == null) {
        throw new IllegalArgumentException("Invalid corner IDs in wall data transfer object.");
      }

      Wall wall = new Wall(startCorner, endCorner);
      wall.setFloor(floor);
      wallRepository.save(wall);
    }

    return floor;
  }

  @GetMapping("/floors/{id}")
  public FloorDataTransferObject getFloorById(@PathVariable Long id) {
    Floor floor =
        floorRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Floor not found with id: " + id));

    List<Corner> corners = cornerRepository.findByFloor(floor);
    List<Wall> walls = wallRepository.findByFloor(floor);

    List<CornerDataTransferObject> cornerDataTransferObjects =
        corners.stream()
            .map(
                corner ->
                    new CornerDataTransferObject(
                        corner.getId(), corner.getPositionX(), corner.getPositionY()))
            .toList();
    List<WallDataTransferObject> wallDataTransferObjects =
        walls.stream()
            .map(
                wall ->
                    new WallDataTransferObject(
                        wall.getStartCorner().getId(), wall.getEndCorner().getId()))
            .toList();

    FloorDataTransferObject floorDto = new FloorDataTransferObject();
    floorDto.name = floor.getName();
    floorDto.corners = cornerDataTransferObjects;
    floorDto.walls = wallDataTransferObjects;
    return floorDto;
  }
}
