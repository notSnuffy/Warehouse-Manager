package com.warehousemanager.shapemanagement.exceptions;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

/** Handles ShapeTemplateDoesNotExist exceptions globally for the application. */
@ControllerAdvice
public class ShapeTemplateDoesNotExistHandler {
  /**
   * Handles ShapeTemplateDoesNotExistException and returns a response with a 404 status code.
   *
   * @param ex the exception that was thrown
   * @return a ResponseEntity containing an ErrorDataTransferObject with the error messages
   */
  @ExceptionHandler(ShapeTemplateDoesNotExistException.class)
  public ResponseEntity<ErrorDataTransferObject> handleShapeTemplateDoesNotExistExceptions(
      ShapeTemplateDoesNotExistException ex) {
    String errorMessage = ex.getMessage();
    List<String> errors = List.of(errorMessage);

    ErrorDataTransferObject errorResponse = new ErrorDataTransferObject(errors);

    HttpStatus status = HttpStatus.NOT_FOUND;

    return new ResponseEntity<>(errorResponse, status);
  }
}
