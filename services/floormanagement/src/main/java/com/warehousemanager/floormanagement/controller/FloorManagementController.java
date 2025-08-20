package com.warehousemanager.floormanagement.controller;

import static org.springframework.http.MediaType.APPLICATION_JSON;

import com.warehousemanager.floormanagement.CornerDataTransferObject;
import com.warehousemanager.floormanagement.FloorDataTransferObject;
import com.warehousemanager.floormanagement.FurnitureInstanceId;
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
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

/** Controller for managing floors. */
@RestController
public class FloorManagementController {
  private final DiscoveryClient discoveryClient;
  private final RestClient restClient;
  private final FloorRepository floorRepository;
  private final WallRepository wallRepository;
  private final CornerRepository cornerRepository;
  private static final Logger logger = LoggerFactory.getLogger(FloorManagementController.class);

  /**
   * Constructor for FloorManagementController.
   *
   * @param floorRepository Repository for managing Floor entities.
   * @param wallRepository Repository for managing Wall entities.
   * @param cornerRepository Repository for managing Corner entities.
   */
  public FloorManagementController(
      DiscoveryClient discoveryClient,
      RestClient.Builder restClientBuilder,
      FloorRepository floorRepository,
      WallRepository wallRepository,
      CornerRepository cornerRepository) {
    this.discoveryClient = discoveryClient;
    this.restClient = restClientBuilder.build();
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
    Floor floor = new Floor(floorDataTransferObject.name());
    floor = floorRepository.save(floor);

    Map<Long, Corner> corners = new HashMap<>();

    for (CornerDataTransferObject cornerDataTransferObject : floorDataTransferObject.corners()) {
      Corner corner =
          new Corner(cornerDataTransferObject.positionX, cornerDataTransferObject.positionY);
      corner.setFloor(floor);
      corner = cornerRepository.save(corner);
      corners.put(cornerDataTransferObject.id, corner);
    }

    for (WallDataTransferObject wallDataTransferObject : floorDataTransferObject.walls()) {
      Corner startCorner = corners.get(wallDataTransferObject.startCornerId);
      Corner endCorner = corners.get(wallDataTransferObject.endCornerId);

      if (startCorner == null || endCorner == null) {
        throw new IllegalArgumentException("Invalid corner IDs in wall data transfer object.");
      }

      Wall wall = new Wall(startCorner, endCorner);
      wall.setFloor(floor);
      wallRepository.save(wall);
    }

    ServiceInstance serviceInstance = discoveryClient.getInstances("furniture-management").get(0);
    String url = serviceInstance.getUri() + "/furniture/instances/batch";

    List<FurnitureInstanceId> furnitureInstances =
        restClient
            .post()
            .uri(url)
            .contentType(APPLICATION_JSON)
            .body(floorDataTransferObject.furniture())
            .retrieve()
            .body(new ParameterizedTypeReference<List<FurnitureInstanceId>>() {});
    logger.info("Furniture instances created: {}", furnitureInstances);
    floor.setFurnitureIds(furnitureInstances.stream().map(FurnitureInstanceId::id).toList());

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

    FloorDataTransferObject floorDto =
        new FloorDataTransferObject(
            floor.getName(),
            cornerDataTransferObjects,
            wallDataTransferObjects,
            List.of() // Assuming furniture is not handled in this method
            );
    return floorDto;
  }
}
