package com.warehousemanager.furnituremanagement.services;

import com.warehousemanager.furnituremanagement.FurnitureResponseDataTransferObject;
import com.warehousemanager.furnituremanagement.ShapeInstance;
import com.warehousemanager.furnituremanagement.ShapeType;
import com.warehousemanager.furnituremanagement.ZoneResponseDataTransferObject;
import com.warehousemanager.furnituremanagement.entities.Furniture;
import com.warehousemanager.furnituremanagement.entities.Zone;
import com.warehousemanager.furnituremanagement.repositories.FurnitureRepository;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

/** Service class for managing furniture items. */
@Service
public class FurnitureService {
  // Repository for managing Furniture entities
  private final FurnitureRepository furnitureRepository;
  private final DiscoveryClient discoveryClient;
  private final RestClient restClient;
  private static final Logger logger = LoggerFactory.getLogger(FurnitureService.class);
  private static final String SHAPE_SERVICE_NAME = "shape-management";
  private static final String SHAPE_BASE_URL = "/shapes/";
  private static final String SHAPE_INSTANCE_ENDPOINT = "/instance";

  /**
   * Constructor for FurnitureService.
   *
   * @param furnitureRepository the repository for managing Furniture entities
   * @param discoveryClient the DiscoveryClient for service discovery
   * @param restClientBuilder the RestClient builder for making REST calls
   */
  public FurnitureService(
      FurnitureRepository furnitureRepository,
      DiscoveryClient discoveryClient,
      RestClient.Builder restClientBuilder) {
    this.furnitureRepository = furnitureRepository;
    this.discoveryClient = discoveryClient;
    this.restClient = restClientBuilder.build();
  }

  /**
   * Retrieves a ShapeInstance by its ID from the shape service.
   *
   * @param shapeId the ID of the shape instance to retrieve
   * @param baseUrl the base URL of the shape service
   * @return the ShapeInstance object
   */
  public ShapeInstance getShapeInstance(Long shapeId, String baseUrl) {
    return restClient
        .get()
        .uri(baseUrl + shapeId + SHAPE_INSTANCE_ENDPOINT)
        .retrieve()
        .body(new ParameterizedTypeReference<ShapeInstance>() {});
  }

  /**
   * Retrieves shape instances associated with the given furniture.
   *
   * @param furniture the furniture whose shape instances are to be retrieved
   * @param baseShapeUrl the base URL for the shape service
   * @return a list of ShapeInstance objects associated with the furniture
   */
  private List<ShapeInstance> getShapeInstances(Furniture furniture, String baseShapeUrl) {
    List<ShapeInstance> shapeInstances = new ArrayList<>();
    for (Long shapeId : furniture.getShapeIds()) {
      ShapeInstance shapeInstance = getShapeInstance(shapeId, baseShapeUrl);

      shapeInstances.add(shapeInstance);
    }
    logger.info("Shape instances retrieved: {}", shapeInstances);
    return shapeInstances;
  }

  /**
   * Retrieves the top-down view shape associated with the given furniture.
   *
   * @param furniture the furniture whose top-down view shape is to be retrieved
   * @param baseShapeUrl the base URL for the shape service
   * @return the ShapeType object representing the top-down view of the furniture
   */
  private ShapeType getTopDownViewShape(Furniture furniture, String baseShapeUrl) {
    ShapeType topDownView =
        restClient
            .get()
            .uri(baseShapeUrl + furniture.getTopDownViewId())
            .retrieve()
            .body(new ParameterizedTypeReference<ShapeType>() {});
    logger.info("Top-down view shape template retrieved: {}", topDownView);
    return topDownView;
  }

  /**
   * Converts a Zone entity to a ZoneResponseDataTransferObject.
   *
   * @param zone the Zone entity to convert
   * @param baseUrl the base URL for the shape service
   * @return the corresponding ZoneResponseDataTransferObject
   */
  public ZoneResponseDataTransferObject convertZoneToDto(Zone zone, String baseUrl) {
    Long shapeId = zone.getShapeId();
    ShapeInstance zoneShape = getShapeInstance(shapeId, baseUrl);
    ZoneResponseDataTransferObject zoneResponse =
        new ZoneResponseDataTransferObject(zone.getId(), zone.getName(), zoneShape);
    return zoneResponse;
  }

  /**
   * Converts a list of Zone entities to a list of ZoneResponseDataTransferObjects.
   *
   * @param zones the list of Zone entities to convert
   * @param baseUrl the base URL for the shape service
   * @return a list of corresponding ZoneResponseDataTransferObjects
   */
  private List<ZoneResponseDataTransferObject> getZonesDto(List<Zone> zones, String baseUrl) {
    List<ZoneResponseDataTransferObject> zoneDtos = new ArrayList<>();
    for (Zone zone : zones) {
      ZoneResponseDataTransferObject zoneDto = convertZoneToDto(zone, baseUrl);
      zoneDtos.add(zoneDto);
    }
    logger.info("Zone DTOs created: {}", zoneDtos);
    return zoneDtos;
  }

  /**
   * Converts a Furniture entity to a FurnitureResponseDataTransferObject.
   *
   * @param furniture the Furniture entity to convert
   * @return the corresponding FurnitureResponseDataTransferObject
   */
  public FurnitureResponseDataTransferObject convertToDto(Furniture furniture) {
    ServiceInstance serviceInstance = discoveryClient.getInstances(SHAPE_SERVICE_NAME).get(0);
    String baseUrl = serviceInstance.getUri() + SHAPE_BASE_URL;
    List<ShapeInstance> shapeInstances = getShapeInstances(furniture, baseUrl);
    ShapeType topDownView = getTopDownViewShape(furniture, baseUrl);
    List<ZoneResponseDataTransferObject> zoneDtos = getZonesDto(furniture.getZones(), baseUrl);
    return new FurnitureResponseDataTransferObject(
        furniture.getId(),
        furniture.getVersion(),
        furniture.getName(),
        topDownView,
        shapeInstances,
        zoneDtos);
  }

  /**
   * Converts a Furniture entity to a FurnitureResponseDataTransferObject.
   *
   * @param furniture the Furniture entity to convert
   * @param baseUrl the base URL for the shape service
   * @return the corresponding FurnitureResponseDataTransferObject
   */
  public FurnitureResponseDataTransferObject convertToDto(Furniture furniture, String baseUrl) {
    List<ShapeInstance> shapeInstances = getShapeInstances(furniture, baseUrl);
    ShapeType topDownView = getTopDownViewShape(furniture, baseUrl);
    List<ZoneResponseDataTransferObject> zoneDtos = getZonesDto(furniture.getZones(), baseUrl);
    return new FurnitureResponseDataTransferObject(
        furniture.getId(),
        furniture.getVersion(),
        furniture.getName(),
        topDownView,
        shapeInstances,
        zoneDtos);
  }
}
