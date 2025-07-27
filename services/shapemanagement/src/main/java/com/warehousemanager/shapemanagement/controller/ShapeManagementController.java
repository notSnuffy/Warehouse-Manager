package com.warehousemanager.shapemanagement.controller;

import com.warehousemanager.shapemanagement.ShapeDataTransferObject;
import com.warehousemanager.shapemanagement.ShapeDtoMapper;
import com.warehousemanager.shapemanagement.entities.Shape;
import com.warehousemanager.shapemanagement.entities.ShapeComponent;
import com.warehousemanager.shapemanagement.repositories.ShapeComponentRepository;
import com.warehousemanager.shapemanagement.repositories.ShapeRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ShapeManagementController {
  private final ShapeRepository shapeRepository;
  private final ShapeComponentRepository shapeComponentRepository;

  public ShapeManagementController(
      ShapeRepository shapeRepository, ShapeComponentRepository shapeComponentRepository) {
    this.shapeRepository = shapeRepository;
    this.shapeComponentRepository = shapeComponentRepository;
  }

  @GetMapping("/shapes")
  public Iterable<Shape> getAllShapes() {
    return shapeRepository.findAll();
  }

  // curl -X POST localhost:8084/shape-management/shapes -H 'Content-type:application/json' -d
  // '{"name":"Rectangle","type":"RECTANGLE","properties":{"positionX":0,"positionY":0,"width":50,"height":50},"public":false, "components":[{"shapeId":1,"propertiesOverride":{"positionX":0,"positionY":0,"width":50,"height":50}},{"shapeId":1,"containerId":2,"propertiesOverride":{"positionX":0,"positionY":0,"width":50,"height":50}}]}'
  @PostMapping("/shapes")
  public Shape createShape(@RequestBody ShapeDataTransferObject shapeDataTransferObject) {
    Shape shape = ShapeDtoMapper.mapToEntity(shapeDataTransferObject);

    Shape savedShape = shapeRepository.save(shape);

    List<ShapeComponent> shapeComponents = new ArrayList<>();
    for (ShapeDataTransferObject.ComponentDataTransferObject componentDto :
        shapeDataTransferObject.getComponents()) {
      Shape containerShape =
          componentDto.getContainerId() == null
              ? savedShape
              : shapeRepository
                  .findById(componentDto.getContainerId())
                  .orElseThrow(() -> new RuntimeException("Container shape not found"));
      Shape componentShape =
          shapeRepository
              .findById(componentDto.getShapeId())
              .orElseThrow(() -> new RuntimeException("Component shape not found"));
      ShapeComponent shapeComponent =
          new ShapeComponent(containerShape, componentShape, componentDto.getPropertiesOverride());
      shapeComponents.add(shapeComponent);
    }
    shapeComponentRepository.saveAll(shapeComponents);
    return savedShape;
  }
}
