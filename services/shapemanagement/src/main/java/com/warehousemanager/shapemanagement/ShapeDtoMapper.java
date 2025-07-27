package com.warehousemanager.shapemanagement;

import com.warehousemanager.shapemanagement.entities.Shape;

/**
 * Mapper class for converting between ShapeDataTransferObject and Shape entity. This class provides
 * static methods to map between the two types.
 */
public class ShapeDtoMapper {
  /**
   * Maps a ShapeDataTransferObject to a Shape entity.
   *
   * @param shapeDateTransferObject the ShapeDataTransferObject to map
   * @return the mapped Shape entity
   */
  public static Shape mapToEntity(ShapeDataTransferObject shapeDateTransferObject) {
    Shape shape =
        new Shape(
            shapeDateTransferObject.getName(),
            shapeDateTransferObject.getType(),
            shapeDateTransferObject.getProperties());
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
    shapeDataTransferObject.setProperties(shape.getProperties());
    return shapeDataTransferObject;
  }
}
