package com.warehousemanager.furnituremanagement.controller;

import static org.springframework.http.MediaType.APPLICATION_JSON;

import com.warehousemanager.furnituremanagement.FurnitureDataTransferObject;
import com.warehousemanager.furnituremanagement.FurnitureResponseDataTransferObject;
import com.warehousemanager.furnituremanagement.FurnitureTopDownView;
import com.warehousemanager.furnituremanagement.Instruction;
import com.warehousemanager.furnituremanagement.Shape;
import com.warehousemanager.furnituremanagement.ShapeInstance;
import com.warehousemanager.furnituremanagement.ShapeType;
import com.warehousemanager.furnituremanagement.ZoneDataTransferObject;
import com.warehousemanager.furnituremanagement.ZoneResponseDataTransferObject;
import com.warehousemanager.furnituremanagement.entities.Furniture;
import com.warehousemanager.furnituremanagement.entities.Zone;
import com.warehousemanager.furnituremanagement.repositories.FurnitureRepository;
import com.warehousemanager.furnituremanagement.repositories.ZoneRepository;
import java.util.ArrayList;
import java.util.List;
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

/** Controller for managing furniture in the warehouse management system. */
@RestController
public class FurnitureManagementController {

  private final DiscoveryClient discoveryClient;
  private final RestClient restClient;
  private final FurnitureRepository furnitureRepository;
  private final ZoneRepository zoneRepository;
  private static final Logger logger = LoggerFactory.getLogger(FurnitureManagementController.class);

  /**
   * Constructs a FurnitureManagementController with the specified dependencies.
   *
   * @param discoveryClient the DiscoveryClient for service discovery
   * @param restClientBuilder the RestClient builder for making REST calls
   * @param furnitureRepository the repository for managing furniture entities
   * @param zoneRepository the repository for managing zone entities
   */
  public FurnitureManagementController(
      DiscoveryClient discoveryClient,
      RestClient.Builder restClientBuilder,
      FurnitureRepository furnitureRepository,
      ZoneRepository zoneRepository) {
    this.discoveryClient = discoveryClient;
    this.restClient = restClientBuilder.build();
    this.furnitureRepository = furnitureRepository;
    this.zoneRepository = zoneRepository;
  }

  /**
   * Retrieves all furniture from the furniture management service.
   *
   * @return a string representation of the furniture management service response
   */
  @GetMapping("/furniture")
  public Iterable<Furniture> getFurniture() {
    logger.info("Received request to get all furniture");
    Iterable<Furniture> furnitureList = furnitureRepository.findAll();
    logger.info("Retrieved {} furniture items", furnitureList.spliterator().getExactSizeIfKnown());
    return furnitureList;
  }

  /**
   * Retrieves a specific furniture item by its ID.
   *
   * @param id the unique identifier of the furniture item
   * @return the Furniture entity with the specified ID
   */
  @GetMapping("/furniture/{id}")
  public FurnitureResponseDataTransferObject getFurnitureById(@PathVariable Long id) {
    logger.info("Received request to get furniture with ID: {}", id);
    Furniture furniture =
        furnitureRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Furniture not found with ID: " + id));
    logger.info("Found furniture: {}", furniture);
    ServiceInstance serviceInstance = discoveryClient.getInstances("shape-management").get(0);
    String baseUrl = serviceInstance.getUri() + "/shapes/";
    List<ShapeInstance> shapeInstances = new ArrayList<>();
    for (Long shapeId : furniture.getShapeIds()) {
      ShapeInstance shapeInstance =
          restClient
              .get()
              .uri(baseUrl + shapeId + "/instance")
              .retrieve()
              .body(new ParameterizedTypeReference<ShapeInstance>() {});

      shapeInstances.add(shapeInstance);
    }
    logger.info("Shape instances retrieved: {}", shapeInstances);
    ShapeType topDownView =
        restClient
            .get()
            .uri(baseUrl + furniture.getTopDownViewId())
            .retrieve()
            .body(new ParameterizedTypeReference<ShapeType>() {});
    logger.info("Top-down view shape instance retrieved: {}", topDownView);
    List<ZoneResponseDataTransferObject> zones = new ArrayList<>();
    for (Zone zone : furniture.getZones()) {
      Long shapeId = zone.getShapeId();
      ShapeType zoneShape =
          restClient
              .get()
              .uri(baseUrl + shapeId)
              .retrieve()
              .body(new ParameterizedTypeReference<ShapeType>() {});
      ZoneResponseDataTransferObject zoneResponse =
          new ZoneResponseDataTransferObject(
              zone.getId(), zone.getName(), zoneShape, zone.getInstructions());
      zones.add(zoneResponse);
    }
    logger.info("Zones retrieved: {}", zones);
    FurnitureResponseDataTransferObject furnitureResponse =
        new FurnitureResponseDataTransferObject(
            furniture.getId(), furniture.getName(), topDownView, shapeInstances, zones);
    logger.info("Returning furniture response: {}", furnitureResponse);
    return furnitureResponse;
  }

  /**
   * Retrieves the top-down view template for a specific furniture.
   *
   * @param id the unique identifier of the furniture
   * @return a FurnitureTopDownView containing the furniture ID and its top-down view shape instance
   *     template
   */
  @GetMapping("/furniture/{id}/topDownView/template")
  public FurnitureTopDownView getFurnitureTopDownViewTemplate(@PathVariable Long id) {
    logger.info("Received request to get top-down view template for furniture with ID: {}", id);
    Furniture furniture =
        furnitureRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Furniture not found with ID: " + id));
    logger.info("Found furniture: {}", furniture);
    ServiceInstance serviceInstance = discoveryClient.getInstances("shape-management").get(0);
    String baseUrl = serviceInstance.getUri() + "/shapes/";
    ShapeInstance topDownViewShape =
        restClient
            .get()
            .uri(baseUrl + furniture.getTopDownViewId() + "/template")
            .retrieve()
            .body(new ParameterizedTypeReference<ShapeInstance>() {});
    logger.info("Top-down view shape instance retrieved: {}", topDownViewShape);
    return new FurnitureTopDownView(furniture.getId(), topDownViewShape);
  }

  /**
   * Creates a new furniture item based on the provided data transfer object.
   *
   * @param furnitureDataTransferObject the data transfer object containing furniture details
   * @return the created Furniture entity
   */
  @PostMapping("/furniture")
  public Furniture createFurniture(
      @RequestBody FurnitureDataTransferObject furnitureDataTransferObject) {
    logger.info("Received request to create furniture: {}", furnitureDataTransferObject);
    String furnitureName = furnitureDataTransferObject.name();
    List<Shape> shapes = furnitureDataTransferObject.shapes();
    Long topDownViewId = furnitureDataTransferObject.topDownViewId();
    logger.info("Creating furniture with name: {}", furnitureName);

    Furniture furniture = new Furniture(furnitureName, topDownViewId);

    ServiceInstance serviceInstance = discoveryClient.getInstances("shape-management").get(0);
    String url = serviceInstance.getUri() + "/shapes/instances/batch";
    List<ShapeInstance> shapeInstances =
        restClient
            .post()
            .uri(url)
            .contentType(APPLICATION_JSON)
            .body(shapes)
            .retrieve()
            .body(new ParameterizedTypeReference<List<ShapeInstance>>() {});
    logger.info("Shape instances created: {}", shapeInstances);
    furniture.setShapeIds(shapeInstances.stream().map(ShapeInstance::id).toList());
    Furniture savedFurniture = furnitureRepository.save(furniture);

    List<ZoneDataTransferObject> zoneDataTransferObjects = furnitureDataTransferObject.zones();
    List<Zone> zones = new ArrayList<>();
    for (ZoneDataTransferObject zoneDataTransferObject : zoneDataTransferObjects) {
      Long shapeId = zoneDataTransferObject.shapeId();
      String zoneName = zoneDataTransferObject.name();
      List<Instruction> instructions = zoneDataTransferObject.instructions();
      logger.info("Creating zone with name: {} and shape ID: {}", zoneName, shapeId);
      Zone zone = new Zone(zoneName, shapeId, savedFurniture, instructions);
      Zone savedZone = zoneRepository.save(zone);
      zones.add(savedZone);
    }

    savedFurniture.setZones(zones);

    return savedFurniture;
  }
}
