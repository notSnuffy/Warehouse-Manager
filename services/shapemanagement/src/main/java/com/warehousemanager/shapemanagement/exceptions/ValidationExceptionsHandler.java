package com.warehousemanager.shapemanagement.exceptions;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

/**
 * Handles validation exceptions globally for the application. This class can be used to customize
 * the response for validation errors.
 */
@ControllerAdvice
public class ValidationExceptionsHandler {
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorDataTransferObject> handleValidationExceptions(
      MethodArgumentNotValidException ex) {
    List<String> errors =
        ex.getBindingResult().getFieldErrors().stream().map(FieldError::getDefaultMessage).toList();

    ErrorDataTransferObject errorResponse = new ErrorDataTransferObject(errors);

    HttpStatus status = HttpStatus.UNPROCESSABLE_ENTITY;

    return new ResponseEntity<>(errorResponse, status);
  }
}
