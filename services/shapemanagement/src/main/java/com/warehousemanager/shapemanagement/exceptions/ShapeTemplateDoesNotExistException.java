package com.warehousemanager.shapemanagement.exceptions;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ShapeTemplateDoesNotExistException extends RuntimeException {
  /** Exception thrown when a shape template with the specified ID does not exist. */
  public ShapeTemplateDoesNotExistException(UUID shapeId) {
    super("Shape template with ID " + shapeId + " does not exist.");
  }
}
