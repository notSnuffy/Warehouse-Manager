package com.warehousemanager.furnituremanagement.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.Instant;

/** Entity representing the history of a FurnitureInstance. */
@Entity
public class FurnitureInstanceHistory {
  /** Unique identifier for the furniture instance history record. */
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Long id;

  /** Identifier for the furniture instance. */
  @Column(nullable = false, updatable = false)
  private Long furnitureInstanceId;

  /** Version of the furniture instance. */
  @Column(nullable = false, updatable = false)
  private Instant furnitureInstanceVersion;

  /** Identifier for the top-down view instance associated with the furniture instance. */
  @Column(nullable = false, updatable = false)
  private Long topDownViewInstanceId;

  /** Default constructor for JPA. */
  protected FurnitureInstanceHistory() {}

  /**
   * Constructs a FurnitureInstanceHistory from a FurnitureInstance.
   *
   * @param furnitureInstance the furniture instance to create the history from
   */
  public FurnitureInstanceHistory(FurnitureInstance furnitureInstance) {
    this.furnitureInstanceId = furnitureInstance.getId();
    this.furnitureInstanceVersion = furnitureInstance.getVersion();
    this.topDownViewInstanceId = furnitureInstance.getTopDownViewInstanceId();
  }

  /**
   * Gets the unique identifier of the furniture instance history record.
   *
   * @return the unique identifier of the furniture instance history record
   */
  public Long getId() {
    return id;
  }

  /**
   * Gets the identifier of the furniture instance.
   *
   * @return the identifier of the furniture instance
   */
  public Long getFurnitureInstanceId() {
    return furnitureInstanceId;
  }

  /**
   * Gets the version of the furniture instance.
   *
   * @return the version of the furniture instance
   */
  public Instant getFurnitureInstanceVersion() {
    return furnitureInstanceVersion;
  }

  /**
   * Gets the identifier for the top-down view instance associated with the furniture instance.
   *
   * @return the identifier for the top-down view instance
   */
  public Long getTopDownViewInstanceId() {
    return topDownViewInstanceId;
  }
}
