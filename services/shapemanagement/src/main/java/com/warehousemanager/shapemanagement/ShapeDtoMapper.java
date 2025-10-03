package com.warehousemanager.shapemanagement;

import com.warehousemanager.shapemanagement.entities.Shape;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Mapper class for converting between ShapeDataTransferObject and Shape entity. This class provides
 * static methods to map between the two types.
 */
public class ShapeDtoMapper {
  public static Logger logger = LoggerFactory.getLogger(ShapeDtoMapper.class);

  /**
   * Maps a ShapeDataTransferObject to a Shape entity with the given id.
   *
   * @param id the id to set on the Shape entity
   * @param shapeDateTransferObject the ShapeDataTransferObject to map
   * @return the mapped Shape entity
   */
  public static Shape mapToEntityWithId(Long id, ShapeDataTransferObject shapeDateTransferObject) {
    Shape shape =
        new Shape(id, shapeDateTransferObject.getName(), shapeDateTransferObject.getType());
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
}
