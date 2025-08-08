package com.warehousemanager.itemmanagement.exceptions;

import java.util.List;

/**
 * Data Transfer Object for error responses. This class encapsulates a list of error messages that
 * can be returned in the response body when validation errors occur.
 */
public class ErrorDataTransferObject {

  /** List of error messages. Each message corresponds to a validation error that occurred. */
  private List<String> errors;

  /**
   * Constructs an ErrorDataTransferObject with a list of error messages.
   *
   * @param errors List of error messages.
   */
  public ErrorDataTransferObject(List<String> errors) {
    this.errors = errors;
  }

  /**
   * Gets the list of error messages.
   *
   * @return List of error messages.
   */
  public List<String> getErrors() {
    return errors;
  }
}
