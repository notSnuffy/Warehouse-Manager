package com.warehousemanager.shapemanagement.exceptions;

import java.util.ArrayList;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

/** Handles unique constraints exceptions globally for the application. */
@ControllerAdvice
public class UniqueConstraintViolatedHandler {
  /**
   * Handles DataIntegrityViolationException and returns a response with a 409 status code.
   *
   * @param ex the exception that was thrown
   * @return a ResponseEntity containing an ErrorDataTransferObject with the error messages
   */
  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<ErrorDataTransferObject> handleUniqueConstraintViolatedExceptions(
      DataIntegrityViolationException ex) {

    List<String> errors = new ArrayList<>();

    if (ex.getMessage().contains("shape_name_key")) {
      errors.add("A shape with the same name already exists.");
    } else {
      errors.add("Unexpected data integrity violation occurred.");
    }

    ErrorDataTransferObject errorResponse = new ErrorDataTransferObject(errors);

    HttpStatus status = HttpStatus.CONFLICT;

    return new ResponseEntity<>(errorResponse, status);
  }
}
