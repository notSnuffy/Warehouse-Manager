package com.warehousemanager.shapemanagement.controller;

import com.warehousemanager.shapemanagement.ShapeDataTransferObject;
import com.warehousemanager.shapemanagement.ShapeDtoMapper;
import com.warehousemanager.shapemanagement.ShapeInstanceDataTransferObject;
import com.warehousemanager.shapemanagement.entities.Shape;
import com.warehousemanager.shapemanagement.entities.ShapeInstance;
import com.warehousemanager.shapemanagement.exceptions.ShapeTemplateDoesNotExistException;
import com.warehousemanager.shapemanagement.repositories.ShapeInstanceRepository;
import com.warehousemanager.shapemanagement.repositories.ShapeRepository;
import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ShapeManagementController {
  private final ShapeRepository shapeRepository;
  private final ShapeInstanceRepository shapeInstanceRepository;

  public ShapeManagementController(
      ShapeRepository shapeRepository, ShapeInstanceRepository shapeInstanceRepository) {
    this.shapeRepository = shapeRepository;
    this.shapeInstanceRepository = shapeInstanceRepository;
  }

  @GetMapping("/shapes")
  public Iterable<Shape> getAllShapes() {
    return shapeRepository.findAll();
  }

  @PostMapping("/shapes")
  public Shape createShape(@Valid @RequestBody ShapeDataTransferObject shapeDataTransferObject) {
    Logger logger = LoggerFactory.getLogger(ShapeManagementController.class);
    logger.info("Received request to create shape: {}", shapeDataTransferObject.getName());
    Shape shape = ShapeDtoMapper.mapToEntity(shapeDataTransferObject);

    Shape savedShape = shapeRepository.save(shape);

    logger.info("Shape created with ID: {}", savedShape.getId());
    ShapeInstance shapeInstance =
        new ShapeInstance(
            savedShape,
            shapeDataTransferObject.getInstructions() != null
                ? shapeDataTransferObject.getInstructions()
                : new ArrayList<>());
    shapeInstance.setTemplate(true);
    logger.info("Creating ShapeInstance for shape ID: {}", savedShape.getId());
    logger.info("ShapeInstance created with instructions: {}", shapeInstance.getInstructions());

    shapeInstanceRepository.save(shapeInstance);

    return savedShape;
  }

  @GetMapping("/shapes/{id}/template")
  public ShapeInstance getShapeTemplate(@PathVariable Long id) {
    Logger logger = LoggerFactory.getLogger(ShapeManagementController.class);
    logger.info("Fetching shape template with ID: {}", id);
    ShapeInstance shapeInstance =
        shapeInstanceRepository
            .findShapeTemplateByIsTemplateTrueAndShapeId(id)
            .orElseThrow(() -> new ShapeTemplateDoesNotExistException(id));
    return shapeInstance;
  }

  @PostMapping("/shapes/instances/batch")
  public Iterable<ShapeInstance> createShapeInstances(
      @Valid @RequestBody
          Iterable<ShapeInstanceDataTransferObject> shapeInstanceDataTransferObjects) {
    Logger logger = LoggerFactory.getLogger(ShapeManagementController.class);
    logger.info("Creating shape instances in batch");

    logger.info("ShapeInstanceDataTransferObjects: {}", shapeInstanceDataTransferObjects);
    List<ShapeInstance> shapeInstances = new ArrayList<>();
    for (ShapeInstanceDataTransferObject shapeInstanceDataTransferObject :
        shapeInstanceDataTransferObjects) {
      Shape shape =
          shapeRepository
              .findById(shapeInstanceDataTransferObject.shapeId())
              .orElseThrow(
                  () ->
                      new RuntimeException(
                          "Shape not found with ID: " + shapeInstanceDataTransferObject.shapeId()));
      ShapeInstance shapeInstance =
          new ShapeInstance(shape, shapeInstanceDataTransferObject.instructions());
      shapeInstances.add(shapeInstance);
      logger.info("Creating ShapeInstance for shape ID: {}", shape.getId());
    }
    Iterable<ShapeInstance> savedShapeInstances = shapeInstanceRepository.saveAll(shapeInstances);
    logger.info(
        "Shape instances created: {}", savedShapeInstances.spliterator().getExactSizeIfKnown());
    for (ShapeInstance shapeInstance : savedShapeInstances) {
      logger.info(
          "ShapeInstance ID: {}, Shape ID: {}",
          shapeInstance.getId(),
          shapeInstance.getShape().getId());
    }
    return savedShapeInstances;
  }

  @PutMapping("/shapes/{id}")
  public Shape updateShape(
      @PathVariable Long id, @Valid @RequestBody ShapeDataTransferObject shapeDataTransferObject) {
    Shape existingShape =
        shapeRepository.findById(id).orElseThrow(() -> new RuntimeException("Shape not found"));
    Logger logger = LoggerFactory.getLogger(ShapeManagementController.class);
    logger.info("Updating shape with ID: {}", id);
    shapeInstanceRepository.deleteById(1L);
    return new Shape(shapeDataTransferObject.getName(), shapeDataTransferObject.getType());
  }
}
