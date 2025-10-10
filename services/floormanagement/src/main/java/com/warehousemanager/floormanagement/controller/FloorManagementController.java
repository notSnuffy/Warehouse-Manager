package com.warehousemanager.floormanagement.controller;

import static org.springframework.http.MediaType.APPLICATION_JSON;

import com.fasterxml.jackson.databind.JsonNode;
import com.warehousemanager.floormanagement.CornerDataTransferObject;
import com.warehousemanager.floormanagement.FloorDataTransferObject;
import com.warehousemanager.floormanagement.FloorResponseDataTransferObject;
import com.warehousemanager.floormanagement.FloorUpdateDataTransferObject;
import com.warehousemanager.floormanagement.FurnitureInstanceId;
import com.warehousemanager.floormanagement.FurnitureUpdateQueryDataTransferObject;
import com.warehousemanager.floormanagement.WallDataTransferObject;
import com.warehousemanager.floormanagement.entities.Corner;
import com.warehousemanager.floormanagement.entities.Floor;
import com.warehousemanager.floormanagement.entities.Wall;
import com.warehousemanager.floormanagement.repositories.CornerRepository;
import com.warehousemanager.floormanagement.repositories.FloorRepository;
import com.warehousemanager.floormanagement.repositories.WallRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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
   * @param discoveryClient Client for service discovery.
   * @param restClientBuilder Builder for creating RestClient instances.
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
    return floorRepository.findByDeletedFalseAndCurrentTrue();
  }

  @PostMapping("/floors")
  public Floor saveFloor(@RequestBody FloorDataTransferObject floorDataTransferObject) {
    Long nextId = floorRepository.getNextId();
    Floor floor = new Floor(nextId, floorDataTransferObject.name());
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

    logger.info(
        "Saving floor with furniture instances: {}",
        furnitureInstances.stream().map(FurnitureInstanceId::id).collect(Collectors.toList()));
    floor.setFurnitureIds(furnitureInstances.stream().map(FurnitureInstanceId::id).toList());
    floor = floorRepository.save(floor);

    return floor;
  }

  @GetMapping("/floors/{id}")
  public FloorResponseDataTransferObject getFloorById(@PathVariable Long id) {
    Floor floor =
        floorRepository
            .findByIdEqualsAndDeletedFalseAndCurrentTrue(id)
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

    List<Long> furnitureIds = floor.getFurnitureIds();
    ServiceInstance serviceInstance = discoveryClient.getInstances("furniture-management").get(0);
    String url = serviceInstance.getUri() + "/furniture/instances/batch";
    String furnitureIdsParameter =
        furnitureIds.stream().map(String::valueOf).collect(Collectors.joining(","));
    JsonNode furniture =
        restClient
            .get()
            .uri(url + "?furnitureInstanceIds=" + furnitureIdsParameter)
            .retrieve()
            .body(JsonNode.class);

    FloorResponseDataTransferObject floorDto =
        new FloorResponseDataTransferObject(
            floor.getId(),
            floor.getVersion(),
            floor.getName(),
            cornerDataTransferObjects,
            wallDataTransferObjects,
            furniture);
    return floorDto;
  }

  @PutMapping("/floors/{id}")
  public Floor updateFloor(
      @PathVariable Long id, @RequestBody FloorUpdateDataTransferObject floorDataTransferObject) {
    Floor existingFloor =
        floorRepository
            .findByIdEqualsAndDeletedFalseAndCurrentTrue(id)
            .orElseThrow(() -> new IllegalArgumentException("Floor not found with id: " + id));

    Floor newFloor = new Floor(existingFloor);
    newFloor.setName(floorDataTransferObject.name());
    newFloor = floorRepository.save(newFloor);

    Map<Long, Corner> corners = new HashMap<>();

    for (CornerDataTransferObject cornerDataTransferObject : floorDataTransferObject.corners()) {
      Corner corner =
          new Corner(cornerDataTransferObject.positionX, cornerDataTransferObject.positionY);
      corner.setFloor(newFloor);
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
      wall.setFloor(newFloor);
      wallRepository.save(wall);
    }

    ServiceInstance serviceInstance = discoveryClient.getInstances("furniture-management").get(0);
    String url = serviceInstance.getUri() + "/furniture/instances";

    List<FurnitureUpdateQueryDataTransferObject> newFurniture = new ArrayList<>();

    List<FurnitureUpdateQueryDataTransferObject> existingFurniture = new ArrayList<>();

    for (FurnitureUpdateQueryDataTransferObject furnitureDto :
        floorDataTransferObject.furniture()) {
      if (furnitureDto.furnitureInstanceId() == null) {
        newFurniture.add(furnitureDto);
      } else {
        existingFurniture.add(furnitureDto);
      }
    }

    List<FurnitureInstanceId> newFurnitureInstanceIds =
        restClient
            .post()
            .uri(url + "/batch")
            .contentType(APPLICATION_JSON)
            .body(newFurniture)
            .retrieve()
            .body(new ParameterizedTypeReference<List<FurnitureInstanceId>>() {});
    logger.info("Furniture instances created: {}", newFurnitureInstanceIds);

    for (FurnitureUpdateQueryDataTransferObject furnitureDto : existingFurniture) {
      JsonNode updatedFurniture =
          restClient
              .put()
              .uri(url + "/" + furnitureDto.furnitureInstanceId())
              .contentType(APPLICATION_JSON)
              .body(furnitureDto)
              .retrieve()
              .body(JsonNode.class);
      logger.info("Furniture instance updated: {}", updatedFurniture);
      newFurnitureInstanceIds.add(new FurnitureInstanceId(furnitureDto.furnitureInstanceId()));
    }

    newFloor.setFurnitureIds(
        newFurnitureInstanceIds.stream().map(FurnitureInstanceId::id).toList());
    Floor savedFloor = floorRepository.save(newFloor);

    existingFloor.setCurrent(false);
    floorRepository.save(existingFloor);

    return savedFloor;
  }

  @DeleteMapping("/floors/{id}")
  public void deleteFloor(@PathVariable Long id) {
    logger.info("Deleting floor with id: {}", id);

    List<Floor> floors = floorRepository.findByIdEqualsAndDeletedFalseOrderByVersionDesc(id);

    if (floors.isEmpty()) {
      throw new IllegalArgumentException("Floor not found with id: " + id);
    }

    for (Floor floor : floors) {
      floor.setDeleted(true);
      floorRepository.save(floor);
    }
    logger.info("Floor with id: {} has been deleted", id);
  }
}
