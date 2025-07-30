package com.warehousemanager.shapemanagement;

import com.warehousemanager.shapemanagement.entities.Shape;
import com.warehousemanager.shapemanagement.entities.ShapeInstance;
import com.warehousemanager.shapemanagement.repositories.ShapeRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Mapper class for converting between ShapeDataTransferObject and Shape entity. This class provides
 * static methods to map between the two types.
 */
public class ShapeDtoMapper {
  public static Logger logger = LoggerFactory.getLogger(ShapeDtoMapper.class);

  /**
   * Maps a ShapeDataTransferObject to a Shape entity.
   *
   * @param shapeDateTransferObject the ShapeDataTransferObject to map
   * @return the mapped Shape entity
   */
  public static Shape mapToEntity(ShapeDataTransferObject shapeDateTransferObject) {
    Shape shape = new Shape(shapeDateTransferObject.getName(), shapeDateTransferObject.getType());
    shape.setPublic(shapeDateTransferObject.isPublic());
    return shape;
  }

  /**
   * Maps a Shape entity to a ShapeDTO.
   *
   * @param shape the Shape entity to map
   * @return the mapped ShapeDTO
   */
  public static ShapeDataTransferObject mapToDto(Shape shape) {
    ShapeDataTransferObject shapeDataTransferObject = new ShapeDataTransferObject();
    shapeDataTransferObject.setName(shape.getName());
    shapeDataTransferObject.setType(shape.getType());
    shapeDataTransferObject.setPublic(shape.isPublic());
    return shapeDataTransferObject;
  }

  public static ShapeInstance convertComponentDtoToEntity(
      ShapeDataTransferObject.ComponentDataTransferObject root,
      ShapeRepository shapeRepository,
      List<ShapeInstance> instances,
      ShapeInstance parent) {

    Shape shape =
        root.getShapeId() != -1 ? shapeRepository.findById(root.getShapeId()).orElseThrow() : null;
    logger.info(
        "Converting component with shapeId: {} to entity",
        root.getShapeId() != null ? root.getShapeId() : "null");
    ShapeInstance shapeInstance =
        new ShapeInstance(root.getPositionX(), root.getPositionY(), shape);

    shapeInstance.setWidth(root.getWidth());
    shapeInstance.setHeight(root.getHeight());
    shapeInstance.setRotation(root.getRotation());
    shapeInstance.setArcStartAngle(root.getArcStartAngle());
    shapeInstance.setArcEndAngle(root.getArcEndAngle());
    shapeInstance.setArcRadius(root.getArcRadius());
    logger.info(
        "Created ShapeInstance with positionX: {}, positionY: {}, width: {}, height: {}, rotation:"
            + " {}, arcStartAngle: {}, arcEndAngle: {}, arcRadius: {}",
        shapeInstance.getPositionX(),
        shapeInstance.getPositionY(),
        shapeInstance.getWidth(),
        shapeInstance.getHeight(),
        shapeInstance.getRotation(),
        shapeInstance.getArcStartAngle(),
        shapeInstance.getArcEndAngle(),
        shapeInstance.getArcRadius());

    if (parent != null) {
      parent.addComponent(shapeInstance);
    }

    instances.add(shapeInstance);

    for (ShapeDataTransferObject.ComponentDataTransferObject component : root.getComponents()) {
      convertComponentDtoToEntity(component, shapeRepository, instances, shapeInstance);
    }

    return shapeInstance;
  }
}
