package com.warehousemanager.furnituremanagement.controller;

import static org.springframework.http.MediaType.APPLICATION_JSON;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.warehousemanager.furnituremanagement.FurnitureDataTransferObject;
import com.warehousemanager.furnituremanagement.FurnitureInstanceCreateDataTransferObject;
import com.warehousemanager.furnituremanagement.FurnitureInstanceResponseDataTransferObject;
import com.warehousemanager.furnituremanagement.FurnitureResponseDataTransferObject;
import com.warehousemanager.furnituremanagement.FurnitureTopDownView;
import com.warehousemanager.furnituremanagement.MoveItemRequest;
import com.warehousemanager.furnituremanagement.Shape;
import com.warehousemanager.furnituremanagement.ShapeInstance;
import com.warehousemanager.furnituremanagement.ShapeInstanceCreateObject;
import com.warehousemanager.furnituremanagement.ShapeType;
import com.warehousemanager.furnituremanagement.ZoneDataTransferObject;
import com.warehousemanager.furnituremanagement.ZoneInstanceResponseDataTransferObject;
import com.warehousemanager.furnituremanagement.ZoneResponseDataTransferObject;
import com.warehousemanager.furnituremanagement.entities.Furniture;
import com.warehousemanager.furnituremanagement.entities.FurnitureInstance;
import com.warehousemanager.furnituremanagement.entities.Zone;
import com.warehousemanager.furnituremanagement.entities.ZoneInstance;
import com.warehousemanager.furnituremanagement.repositories.FurnitureInstanceRepository;
import com.warehousemanager.furnituremanagement.repositories.FurnitureRepository;
import com.warehousemanager.furnituremanagement.repositories.ZoneInstanceRepository;
import com.warehousemanager.furnituremanagement.repositories.ZoneRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

/** Controller for managing furniture in the warehouse management system. */
@RestController
public class FurnitureManagementController {

  private final DiscoveryClient discoveryClient;
  private final RestClient restClient;
  private final FurnitureRepository furnitureRepository;
  private final ZoneRepository zoneRepository;
  private final FurnitureInstanceRepository furnitureInstanceRepository;
  private final ZoneInstanceRepository zoneInstanceRepository;
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
      ZoneRepository zoneRepository,
      FurnitureInstanceRepository furnitureInstanceRepository,
      ZoneInstanceRepository zoneInstanceRepository) {

    this.discoveryClient = discoveryClient;
    this.restClient = restClientBuilder.build();
    this.furnitureRepository = furnitureRepository;
    this.zoneRepository = zoneRepository;
    this.furnitureInstanceRepository = furnitureInstanceRepository;
    this.zoneInstanceRepository = zoneInstanceRepository;
  }

  /**
   * Retrieves all furniture from the furniture management service.
   *
   * @return a string representation of the furniture management service response
   */
  @GetMapping("/furniture")
  public Iterable<Furniture> getFurniture() {
    logger.info("Received request to get all furniture");
    Iterable<Furniture> furnitureList = furnitureRepository.findByDeletedFalseAndCurrentTrue();
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
        furnitureRepository.findByIdEqualsAndDeletedFalseAndCurrentTrue(id).orElse(null);
    if (furniture == null) {
      throw new IllegalArgumentException("Furniture not found with ID: " + id);
    }
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
    logger.info("Top-down view shape template retrieved: {}", topDownView);
    List<ZoneResponseDataTransferObject> zones = new ArrayList<>();
    for (Zone zone : furniture.getZones()) {
      Long shapeId = zone.getShapeId();
      ShapeInstance zoneShape =
          restClient
              .get()
              .uri(baseUrl + shapeId + "/instance")
              .retrieve()
              .body(new ParameterizedTypeReference<ShapeInstance>() {});
      ZoneResponseDataTransferObject zoneResponse =
          new ZoneResponseDataTransferObject(zone.getId(), zone.getName(), zoneShape);
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
        furnitureRepository.findByIdEqualsAndDeletedFalseAndCurrentTrue(id).orElse(null);
    if (furniture == null) {
      throw new IllegalArgumentException("Furniture not found with ID: " + id);
    }
    logger.info("Found furniture: {}", furniture);
    ServiceInstance serviceInstance = discoveryClient.getInstances("shape-management").get(0);
    String baseUrl = serviceInstance.getUri() + "/shapes/";
    ShapeInstance topDownViewShape =
        restClient
            .get()
            .uri(baseUrl + furniture.getTopDownViewId() + "/template/latest")
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

    Long nextId = furnitureRepository.getNextId();
    Furniture furniture = new Furniture(nextId, furnitureName, topDownViewId);

    ServiceInstance serviceInstance = discoveryClient.getInstances("shape-management").get(0);
    String batchShapeUrl = serviceInstance.getUri() + "/shapes/instances/batch";
    List<ShapeInstance> shapeInstances =
        restClient
            .post()
            .uri(batchShapeUrl)
            .contentType(APPLICATION_JSON)
            .body(shapes)
            .retrieve()
            .body(new ParameterizedTypeReference<List<ShapeInstance>>() {});
    logger.info("Shape instances created: {}", shapeInstances);
    furniture.setShapeIds(shapeInstances.stream().map(ShapeInstance::id).toList());
    Furniture savedFurniture = furnitureRepository.save(furniture);

    String zoneCreationUrl = serviceInstance.getUri() + "/shapes/instances";
    List<ZoneDataTransferObject> zoneDataTransferObjects = furnitureDataTransferObject.zones();
    List<Zone> zones = new ArrayList<>();
    for (ZoneDataTransferObject zoneDataTransferObject : zoneDataTransferObjects) {
      Shape shape = zoneDataTransferObject.shape();
      ShapeInstance shapeInstance =
          restClient
              .post()
              .uri(zoneCreationUrl)
              .contentType(APPLICATION_JSON)
              .body(shape)
              .retrieve()
              .body(new ParameterizedTypeReference<ShapeInstance>() {});
      String zoneName = zoneDataTransferObject.name();
      logger.info("Creating zone with name: {} and shape ID: {}", zoneName, shape.shapeId());
      Zone zone = new Zone(zoneName, shapeInstance.id(), savedFurniture);
      Zone savedZone = zoneRepository.save(zone);
      zones.add(savedZone);
    }

    savedFurniture.setZones(zones);

    return savedFurniture;
  }

  /**
   * Filters out deleted items from the provided JSON node and updates the zone instance
   * accordingly.
   *
   * @param items the JSON node containing items to be filtered
   * @param zoneInstance the zone instance to remove deleted item IDs from
   * @return a JSON node containing only non-deleted items
   */
  public JsonNode filterDeletedItems(JsonNode items, ZoneInstance zoneInstance) {
    ObjectMapper mapper = new ObjectMapper();
    ObjectNode filteredItems = mapper.createObjectNode();

    Set<Map.Entry<String, JsonNode>> properties = items.properties();
    for (Map.Entry<String, JsonNode> entry : properties) {
      JsonNode itemNode = entry.getValue();
      Long itemId = itemNode.get("id").asLong();

      boolean isDeleted = itemNode.get("deleted").asBoolean();
      if (!isDeleted) {
        filteredItems.set(entry.getKey(), itemNode);
      } else {
        zoneInstance.removeItemId(itemId);
        zoneInstanceRepository.save(zoneInstance);
      }
    }
    return filteredItems;
  }

  @GetMapping("/furniture/instances/{id}")
  public FurnitureInstanceResponseDataTransferObject getFurnitureInstanceById(
      @PathVariable Long id) {
    logger.info("Received request to get furniture instance with ID: {}", id);
    FurnitureInstance furnitureInstance =
        furnitureInstanceRepository
            .findById(id)
            .orElseThrow(() -> new RuntimeException("Furniture instance not found with ID: " + id));
    logger.info("Found furniture instance: {}", furnitureInstance);
    ServiceInstance shapeServiceInstance = discoveryClient.getInstances("shape-management").get(0);
    String shapesUrl = shapeServiceInstance.getUri() + "/shapes/";
    FurnitureResponseDataTransferObject furnitureResponseDataTransferObject =
        getFurnitureById(furnitureInstance.getFurniture().getId());
    List<ZoneInstanceResponseDataTransferObject> zoneInstances = new ArrayList<>();

    ServiceInstance itemServiceInstance = discoveryClient.getInstances("item-management").get(0);
    String itemsUrl = itemServiceInstance.getUri() + "/items/batch";

    for (ZoneInstance zoneInstance : furnitureInstance.getZoneInstances()) {
      Zone zone = zoneInstance.getZone();
      Long shapeId = zone.getShapeId();
      ShapeInstance zoneShape =
          restClient
              .get()
              .uri(shapesUrl + shapeId + "/instance")
              .retrieve()
              .body(new ParameterizedTypeReference<ShapeInstance>() {});
      ZoneResponseDataTransferObject zoneResponse =
          new ZoneResponseDataTransferObject(zone.getId(), zone.getName(), zoneShape);

      Set<Long> itemIds = zoneInstance.getItemIds();
      String itemIdsParameter =
          itemIds.stream().map(String::valueOf).collect(Collectors.joining(","));
      JsonNode items =
          restClient
              .get()
              .uri(itemsUrl + "?itemIds=" + itemIdsParameter)
              .retrieve()
              .body(JsonNode.class);

      JsonNode filteredItems = filterDeletedItems(items, zoneInstance);

      ZoneInstanceResponseDataTransferObject zoneInstanceResponse =
          new ZoneInstanceResponseDataTransferObject(
              zoneInstance.getId(), zoneResponse, filteredItems);
      zoneInstances.add(zoneInstanceResponse);
    }
    ShapeInstance topDownViewShapeInstance =
        restClient
            .get()
            .uri(shapesUrl + furnitureInstance.getTopDownViewInstanceId() + "/instance")
            .retrieve()
            .body(new ParameterizedTypeReference<ShapeInstance>() {});
    FurnitureInstanceResponseDataTransferObject response =
        new FurnitureInstanceResponseDataTransferObject(
            furnitureInstance.getId(),
            topDownViewShapeInstance,
            zoneInstances,
            furnitureResponseDataTransferObject);
    logger.info("Returning furniture instance response: {}", response);
    return response;
  }

  @GetMapping("/furniture/instances/batch")
  public List<FurnitureInstanceResponseDataTransferObject> getFurnitureInstances(
      @RequestParam List<Long> furnitureInstanceIds) {
    logger.info("Received request to get furniture instances for IDs: {}", furnitureInstanceIds);
    ServiceInstance shapeServiceInstance = discoveryClient.getInstances("shape-management").get(0);
    String shapesUrl = shapeServiceInstance.getUri() + "/shapes/";

    ServiceInstance itemServiceInstance = discoveryClient.getInstances("item-management").get(0);
    String itemsUrl = itemServiceInstance.getUri() + "/items/batch";

    Map<Long, FurnitureResponseDataTransferObject> furnitureMap = new HashMap<>();
    Map<Long, ShapeInstance> zoneShapeMap = new HashMap<>();
    List<FurnitureInstanceResponseDataTransferObject> furnitureInstances = new ArrayList<>();
    for (Long furnitureInstanceId : furnitureInstanceIds) {
      logger.info("Fetching furniture instance for ID: {}", furnitureInstanceId);
      FurnitureInstance furnitureInstance =
          furnitureInstanceRepository
              .findById(furnitureInstanceId)
              .orElseThrow(
                  () ->
                      new RuntimeException(
                          "Furniture instance not found with ID: " + furnitureInstanceId));
      // Prepare furniture response data transfer object
      FurnitureResponseDataTransferObject furnitureResponseDataTransferObject = null;
      Long furnitureId = furnitureInstance.getFurniture().getId();
      if (!furnitureMap.containsKey(furnitureId)) {
        furnitureResponseDataTransferObject = getFurnitureById(furnitureId);
        furnitureMap.put(furnitureId, furnitureResponseDataTransferObject);
      } else {
        furnitureResponseDataTransferObject = furnitureMap.get(furnitureId);
      }

      // Prepare zone instances for the furniture instance
      List<ZoneInstanceResponseDataTransferObject> zoneInstances = new ArrayList<>();
      for (ZoneInstance zoneInstance : furnitureInstance.getZoneInstances()) {
        Zone zone = zoneInstance.getZone();
        Long shapeId = zone.getShapeId();
        ShapeInstance zoneShape = null;
        if (!zoneShapeMap.containsKey(shapeId)) {
          zoneShape =
              restClient
                  .get()
                  .uri(shapesUrl + shapeId + "/instance")
                  .retrieve()
                  .body(new ParameterizedTypeReference<ShapeInstance>() {});
        } else {
          zoneShape = zoneShapeMap.get(shapeId);
        }

        Set<Long> itemIds = zoneInstance.getItemIds();
        String itemIdsParameter =
            itemIds.stream().map(String::valueOf).collect(Collectors.joining(","));
        JsonNode items =
            restClient
                .get()
                .uri(itemsUrl + "?itemIds=" + itemIdsParameter)
                .retrieve()
                .body(JsonNode.class);

        JsonNode filteredItems = filterDeletedItems(items, zoneInstance);

        ZoneInstanceResponseDataTransferObject zoneInstanceResponse =
            new ZoneInstanceResponseDataTransferObject(
                zoneInstance.getId(),
                new ZoneResponseDataTransferObject(zone.getId(), zone.getName(), zoneShape),
                filteredItems);
        zoneInstances.add(zoneInstanceResponse);
      }

      // Fetch the top-down view shape instance for the zone
      ShapeInstance topDownViewShapeInstance =
          restClient
              .get()
              .uri(shapesUrl + furnitureInstance.getTopDownViewInstanceId() + "/instance")
              .retrieve()
              .body(new ParameterizedTypeReference<ShapeInstance>() {});

      // Prepare the furniture instance response data transfer object
      FurnitureInstanceResponseDataTransferObject furnitureInstanceResponse =
          new FurnitureInstanceResponseDataTransferObject(
              furnitureInstance.getId(),
              topDownViewShapeInstance,
              zoneInstances,
              furnitureResponseDataTransferObject);
      furnitureInstances.add(furnitureInstanceResponse);
      logger.info("Furniture instance created: {}", furnitureInstanceResponse);
    }
    logger.info("Found {} furniture instances for the provided IDs", furnitureInstances.size());
    return furnitureInstances;
  }

  @PostMapping("/furniture/instances/batch")
  public Iterable<FurnitureInstance> createFurnitureInstances(
      @RequestBody List<FurnitureInstanceCreateDataTransferObject> furnitureDataTransferObjects) {
    logger.info("Received request to create multiple furniture instances");
    ServiceInstance serviceInstance = discoveryClient.getInstances("shape-management").get(0);
    String url = serviceInstance.getUri() + "/shapes/instances";
    List<FurnitureInstance> createdFurniture = new ArrayList<>();
    for (FurnitureInstanceCreateDataTransferObject furnitureDataTransferObject :
        furnitureDataTransferObjects) {
      logger.info(
          "Creating furniture instance for furniture ID: {}",
          furnitureDataTransferObject.furnitureId());
      Furniture furniture =
          furnitureRepository
              .findById(furnitureDataTransferObject.furnitureId())
              .orElseThrow(
                  () ->
                      new RuntimeException(
                          "Furniture not found with ID: "
                              + furnitureDataTransferObject.furnitureId()));
      ShapeInstanceCreateObject shapeInstanceCreateObject =
          new ShapeInstanceCreateObject(
              furnitureDataTransferObject.shapeId(), furnitureDataTransferObject.instructions());
      ShapeInstance topDownViewInstance =
          restClient
              .post()
              .uri(url)
              .contentType(APPLICATION_JSON)
              .body(shapeInstanceCreateObject)
              .retrieve()
              .body(new ParameterizedTypeReference<ShapeInstance>() {});
      logger.info("Top-down view shape instance created: {}", topDownViewInstance);
      FurnitureInstance furnitureInstance =
          new FurnitureInstance(furniture, topDownViewInstance.id());
      createdFurniture.add(furnitureInstance);
    }
    logger.info("Created {} furniture instances", createdFurniture.size());
    Iterable<FurnitureInstance> savedFurnitureInstances =
        furnitureInstanceRepository.saveAll(createdFurniture);
    for (FurnitureInstance furnitureInstance : savedFurnitureInstances) {
      logger.info(
          "Creating zone instances for furniture instance ID: {}", furnitureInstance.getId());
      List<ZoneInstance> zoneInstances = new ArrayList<>();
      for (Zone zone : furnitureInstance.getFurniture().getZones()) {
        ZoneInstance zoneInstance = new ZoneInstance(zone, furnitureInstance);
        ZoneInstance savedZoneInstance = zoneInstanceRepository.save(zoneInstance);
        logger.info("Created zone instance: {}", savedZoneInstance);
        zoneInstances.add(savedZoneInstance);
      }
      furnitureInstance.setZoneInstances(zoneInstances);
    }
    logger.info("Saved furniture instances: {}", savedFurnitureInstances);
    return savedFurnitureInstances;
  }

  @PostMapping("/furniture/zones/instances/moveItem/batch")
  public void moveItems(@RequestBody List<MoveItemRequest> requests) {
    for (MoveItemRequest request : requests) {
      Long itemId = request.itemId();
      Long oldZoneId = request.oldZoneId();
      ZoneInstance oldZoneInstance =
          oldZoneId != null ? zoneInstanceRepository.findById(oldZoneId).orElse(null) : null;

      if (oldZoneInstance != null) {
        if (!oldZoneInstance.containsItemId(itemId)) {
          throw new IllegalArgumentException(
              "Item ID " + itemId + " not found in old zone instance " + oldZoneId);
        }
        oldZoneInstance.removeItemId(itemId);
        zoneInstanceRepository.save(oldZoneInstance);
      }

      Long newZoneId = request.newZoneId();
      ZoneInstance newZoneInstance =
          newZoneId != null ? zoneInstanceRepository.findById(newZoneId).orElse(null) : null;
      if (newZoneInstance != null) {
        newZoneInstance.addItemId(itemId);
        zoneInstanceRepository.save(newZoneInstance);
      }
      logger.info(
          "Moved item ID {} from zone instance {} to zone instance {}",
          itemId,
          oldZoneId,
          newZoneId);
    }
  }
}
