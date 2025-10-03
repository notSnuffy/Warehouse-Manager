package com.warehousemanager.shapemanagement.controller;

import com.warehousemanager.shapemanagement.Instruction;
import com.warehousemanager.shapemanagement.ShapeDataTransferObject;
import com.warehousemanager.shapemanagement.ShapeDtoMapper;
import com.warehousemanager.shapemanagement.ShapeInstanceDataTransferObject;
import com.warehousemanager.shapemanagement.ShapeInstanceResponseDataTransferObject;
import com.warehousemanager.shapemanagement.ShapeType;
import com.warehousemanager.shapemanagement.entities.Shape;
import com.warehousemanager.shapemanagement.entities.ShapeInstance;
import com.warehousemanager.shapemanagement.exceptions.ShapeTemplateDoesNotExistException;
import com.warehousemanager.shapemanagement.repositories.ShapeInstanceRepository;
import com.warehousemanager.shapemanagement.repositories.ShapeRepository;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/** Controller for managing shapes in the warehouse management system. */
@RestController
public class ShapeManagementController {
  private final ShapeRepository shapeRepository;
  private final ShapeInstanceRepository shapeInstanceRepository;
  private static final Logger logger = LoggerFactory.getLogger(ShapeManagementController.class);

  /**
   * Constructs a ShapeManagementController with the specified repositories.
   *
   * @param shapeRepository the repository for managing shape entities
   * @param shapeInstanceRepository the repository for managing shape instance entities
   */
  public ShapeManagementController(
      ShapeRepository shapeRepository, ShapeInstanceRepository shapeInstanceRepository) {
    this.shapeRepository = shapeRepository;
    this.shapeInstanceRepository = shapeInstanceRepository;
  }

  /**
   * Retrieves all shapes from the shape management service.
   *
   * @return an iterable collection of all shapes
   */
  @GetMapping("/shapes")
  public List<Shape> getAllShapes() {
    logger.info("Fetching all shapes");
    List<Shape> shapes = shapeRepository.findByCurrentTrueAndDeletedFalse();
    logger.info("Total shapes found: {}", shapes.size());
    return shapes;
  }

  /**
   * Creates a new shape based on the provided shape data transfer object.
   *
   * @param shapeDataTransferObject the data transfer object containing shape details
   * @return the created shape entity
   */
  @PostMapping("/shapes")
  public Shape createShape(@Valid @RequestBody ShapeDataTransferObject shapeDataTransferObject) {
    logger.info("Received request to create shape: {}", shapeDataTransferObject.getName());
    Long nextId = shapeRepository.getNextId();
    Shape shape = ShapeDtoMapper.mapToEntityWithId(nextId, shapeDataTransferObject);

    Shape savedShape = shapeRepository.save(shape);

    logger.info("Shape created with ID: {}", savedShape.getId());
    ShapeInstance shapeInstance =
        new ShapeInstance(
            savedShape.getId(),
            savedShape.getVersion(),
            shapeDataTransferObject.getInstructions() != null
                ? shapeDataTransferObject.getInstructions()
                : new ArrayList<>());
    shapeInstance.setTemplate(true);
    logger.info("Creating ShapeInstance for shape ID: {}", savedShape.getId());
    logger.info("ShapeInstance created with instructions: {}", shapeInstance.getInstructions());

    shapeInstanceRepository.save(shapeInstance);

    return savedShape;
  }

  /**
   * Retrieves a shape by its ID.
   *
   * @param id the unique identifier of the shape
   * @return the shape entity with the specified ID
   */
  @GetMapping("/shapes/{id}")
  public Shape getShapeById(@PathVariable Long id) {
    logger.info("Fetching shape with ID: {}", id);
    Shape shape =
        shapeRepository
            .findByIdEqualsAndDeletedFalseAndCurrentTrue(id)
            .orElseThrow(() -> new RuntimeException("Shape not found with ID: " + id));
    logger.info("Found shape: {}", shape);
    return shape;
  }

  @PutMapping("/shapes/{id}")
  public Shape updateShape(
      @PathVariable Long id, @Valid @RequestBody ShapeDataTransferObject shapeDataTransferObject) {
    logger.info("Updating shape with ID: {}", id);
    Shape existingShape =
        shapeRepository
            .findByIdEqualsAndDeletedFalseAndCurrentTrue(id)
            .orElseThrow(() -> new RuntimeException("Shape not found"));
    String newName = shapeDataTransferObject.getName();
    ShapeType newType = shapeDataTransferObject.getType();
    boolean isPublic = shapeDataTransferObject.isPublic();

    Shape newShape = new Shape(existingShape);
    newShape.setName(newName);
    newShape.setType(newType);
    newShape.setPublic(isPublic);
    newShape = shapeRepository.save(newShape);
    logger.info("Shape updated: {}", newShape);

    existingShape.setCurrent(false);
    shapeRepository.save(existingShape);

    List<Instruction> newInstructions = shapeDataTransferObject.getInstructions();
    ShapeInstance shapeInstance =
        new ShapeInstance(
            newShape.getId(),
            newShape.getVersion(),
            newInstructions != null ? newInstructions : new ArrayList<>());
    shapeInstance.setTemplate(true);
    logger.info("Creating new ShapeInstance for updated shape ID: {}", newShape.getId());

    shapeInstanceRepository.save(shapeInstance);

    return newShape;
  }

  @DeleteMapping("/shapes/{id}")
  public void deleteShape(@PathVariable Long id) {
    logger.info("Deleting shape with ID: {}", id);
    List<Shape> shapes = shapeRepository.findByIdEqualsAndDeletedFalseOrderByVersionDesc(id);

    if (shapes.size() == 0) {
      throw new IllegalArgumentException("Shape not found");
    }

    for (Shape shape : shapes) {
      shape.setDeleted(true);
      shapeRepository.save(shape);
    }
    logger.info("Shape with ID: {} has been deleted", id);
  }

  /**
   * Retrieves a shape template by its ID and newest version.
   *
   * @param id the unique identifier of the shape
   * @return the shape instance representing the template
   * @throws ShapeTemplateDoesNotExistException if no template exists for the given shape ID
   */
  @GetMapping("/shapes/{id}/template/latest")
  public ShapeInstanceResponseDataTransferObject getShapeTemplate(@PathVariable Long id) {
    logger.info("Fetching shape template with ID: {}", id);
    ShapeInstance shapeInstance =
        shapeInstanceRepository
            .findLatestTemplateByShapeId(id)
            .orElseThrow(() -> new ShapeTemplateDoesNotExistException(id));
    return new ShapeInstanceResponseDataTransferObject(
        shapeInstance.getId(),
        shapeRepository
            .findByIdEqualsAndDeletedFalseAndCurrentTrue(shapeInstance.getShapeId())
            .orElse(null),
        shapeInstance.getShapeVersion(),
        shapeInstance.isTemplate(),
        shapeInstance.getInstructions());
  }

  /**
   * Retrieves a specific shape instance by its ID.
   *
   * @param id the unique identifier of the shape instance
   * @return the shape instance with the specified ID
   */
  @GetMapping("/shapes/{id}/instance")
  public ShapeInstanceResponseDataTransferObject getShapeInstance(@PathVariable Long id) {
    logger.info("Fetching shape instance with ID: {}", id);
    ShapeInstance shapeInstance =
        shapeInstanceRepository
            .findById(id)
            .orElseThrow(() -> new RuntimeException("Shape instance not found with ID: " + id));
    logger.info("Found shape instance: {}", shapeInstance);
    return new ShapeInstanceResponseDataTransferObject(
        shapeInstance.getId(),
        shapeRepository
            .findByIdEqualsAndDeletedFalseAndCurrentTrue(shapeInstance.getShapeId())
            .orElse(null),
        shapeInstance.getShapeVersion(),
        shapeInstance.isTemplate(),
        shapeInstance.getInstructions());
  }

  @PostMapping("/shapes/instances")
  public ShapeInstanceResponseDataTransferObject createShapeInstance(
      @Valid @RequestBody ShapeInstanceDataTransferObject shapeInstanceDataTransferObject) {
    logger.info("Creating shape instance with data: {}", shapeInstanceDataTransferObject);
    Long shapeId = shapeInstanceDataTransferObject.shapeId();
    Shape shape =
        shapeRepository
            .findByIdEqualsAndDeletedFalseAndCurrentTrue(shapeId)
            .orElseThrow(
                () ->
                    new RuntimeException(
                        "Shape not found with ID: " + shapeInstanceDataTransferObject.shapeId()));
    Instant shapeVersion =
        shapeInstanceDataTransferObject.shapeVersion() != null
            ? shapeInstanceDataTransferObject.shapeVersion()
            : shape.getVersion();
    ShapeInstance shapeInstance =
        new ShapeInstance(
            shape.getId(), shapeVersion, shapeInstanceDataTransferObject.instructions());
    logger.info("ShapeInstance created with instructions: {}", shapeInstance.getInstructions());
    ShapeInstance savedShapeInstance = shapeInstanceRepository.save(shapeInstance);
    logger.info("ShapeInstance created with ID: {}", savedShapeInstance.getId());
    return new ShapeInstanceResponseDataTransferObject(
        savedShapeInstance.getId(),
        shape,
        savedShapeInstance.getShapeVersion(),
        savedShapeInstance.isTemplate(),
        savedShapeInstance.getInstructions());
  }

  /**
   * Creates new shape instances in batch based on the provided data transfer objects.
   *
   * @param shapeInstanceDataTransferObjects the iterable collection of shape instance data transfer
   *     objects
   * @return an iterable collection of created shape instances
   */
  @PostMapping("/shapes/instances/batch")
  public Iterable<ShapeInstanceResponseDataTransferObject> createShapeInstances(
      @Valid @RequestBody
          Iterable<ShapeInstanceDataTransferObject> shapeInstanceDataTransferObjects) {
    logger.info("Creating shape instances in batch");

    logger.info("ShapeInstanceDataTransferObjects: {}", shapeInstanceDataTransferObjects);
    List<ShapeInstance> shapeInstances = new ArrayList<>();
    for (ShapeInstanceDataTransferObject shapeInstanceDataTransferObject :
        shapeInstanceDataTransferObjects) {
      Shape shape =
          shapeRepository
              .findByIdEqualsAndDeletedFalseAndCurrentTrue(
                  shapeInstanceDataTransferObject.shapeId())
              .orElseThrow(
                  () ->
                      new RuntimeException(
                          "Shape not found with ID: " + shapeInstanceDataTransferObject.shapeId()));
      Instant shapeVersion =
          shapeInstanceDataTransferObject.shapeVersion() != null
              ? shapeInstanceDataTransferObject.shapeVersion()
              : shape.getVersion();
      ShapeInstance shapeInstance =
          new ShapeInstance(
              shape.getId(), shapeVersion, shapeInstanceDataTransferObject.instructions());
      shapeInstances.add(shapeInstance);
      logger.info("Creating ShapeInstance for shape ID: {}", shape.getId());
    }
    Iterable<ShapeInstance> savedShapeInstances = shapeInstanceRepository.saveAll(shapeInstances);
    logger.info(
        "Shape instances created: {}", savedShapeInstances.spliterator().getExactSizeIfKnown());
    List<ShapeInstanceResponseDataTransferObject> responseDtos = new ArrayList<>();
    for (ShapeInstance savedShapeInstance : savedShapeInstances) {
      Shape shape =
          shapeRepository
              .findByIdEqualsAndDeletedFalseAndCurrentTrue(savedShapeInstance.getShapeId())
              .orElse(null);
      responseDtos.add(
          new ShapeInstanceResponseDataTransferObject(
              savedShapeInstance.getId(),
              shape,
              savedShapeInstance.getShapeVersion(),
              savedShapeInstance.isTemplate(),
              savedShapeInstance.getInstructions()));
    }
    return responseDtos;
  }
}
