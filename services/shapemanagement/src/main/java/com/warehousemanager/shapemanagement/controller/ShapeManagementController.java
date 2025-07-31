package com.warehousemanager.shapemanagement.controller;

import com.warehousemanager.shapemanagement.ShapeDataTransferObject;
import com.warehousemanager.shapemanagement.ShapeDtoMapper;
import com.warehousemanager.shapemanagement.entities.Shape;
import com.warehousemanager.shapemanagement.entities.ShapeInstance;
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

  // curl -X POST localhost:8084/shape-management/shapes -H 'Content-type:application/json' -d
  // '{"name":"Sharp Heart","type":"CONTAINER","root":{"positionX":10,"positionY":10, "components":
  // [{"positionX":25,"positionY":25,"shapeId":1},{"positionX":30,"positionY":30,"shapeId":1}]}}'
  @PostMapping("/shapes")
  public Shape createShape(@Valid @RequestBody ShapeDataTransferObject shapeDataTransferObject) {
    Logger logger = LoggerFactory.getLogger(ShapeManagementController.class);
    logger.info("Received request to create shape: {}", shapeDataTransferObject.getName());
    Shape shape = ShapeDtoMapper.mapToEntity(shapeDataTransferObject);

    Shape savedShape = shapeRepository.save(shape);

    if (shapeDataTransferObject.getRoot() == null) {
      return savedShape;
    }

    List<ShapeInstance> instances = new ArrayList<>();

    ShapeInstance shapeInstance =
        ShapeDtoMapper.convertComponentDtoToEntity(
            shapeDataTransferObject.getRoot(), shapeRepository, instances, null);
    shapeInstance.setShape(savedShape);
    shapeInstanceRepository.saveAll(instances);

    return savedShape;
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
