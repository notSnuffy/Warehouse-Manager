package com.warehousemanager.shapemanagement;

import com.warehousemanager.shapemanagement.entities.Properties;
import com.warehousemanager.shapemanagement.entities.Shape;
import com.warehousemanager.shapemanagement.entities.ShapeComponent;
import com.warehousemanager.shapemanagement.repositories.ShapeComponentRepository;
import com.warehousemanager.shapemanagement.repositories.ShapeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ShapeManagementApplication {
  private static final Logger logger = LoggerFactory.getLogger(ShapeManagementApplication.class);

  public static void main(String[] args) {
    SpringApplication.run(ShapeManagementApplication.class, args);
  }

  @Bean
  public CommandLineRunner commandLineRunner(
      ShapeRepository shapeRepository, ShapeComponentRepository shapeComponentRepository) {
    return args -> {
      logger.info("Shape Management Application has started successfully.");

      Properties properties = new Properties(0, 0);
      properties.setWidth(50);
      properties.setHeight(50);

      Properties properties2 = new Properties(100, 100);
      properties2.setWidth(75);
      properties2.setHeight(75);

      shapeRepository.save(new Shape("Rectangle", ShapeType.RECTANGLE, properties));
      shapeRepository.save(new Shape("Composite Shape", ShapeType.CONTAINER, properties2));

      ShapeComponent component1 =
          new ShapeComponent(
              shapeRepository.findById(2L).orElseThrow(),
              shapeRepository.findById(1L).orElseThrow(),
              new Properties(10, 10));
      ShapeComponent component2 =
          new ShapeComponent(
              shapeRepository.findById(2L).orElseThrow(),
              shapeRepository.findById(1L).orElseThrow(),
              new Properties(20, 20));

      shapeComponentRepository.save(component1);
      shapeComponentRepository.save(component2);

      shapeRepository
          .findAll()
          .forEach(
              s ->
                  logger.info(
                      "Shape found: ID: {}, Name: {}, Type: {}",
                      s.getId(),
                      s.getName(),
                      s.getType()));
      shapeComponentRepository
          .findAll()
          .forEach(
              sc ->
                  logger.info(
                      "ShapeComponent found: ID: {}, Container ID: {}, Component ID: {}",
                      sc.getId(),
                      sc.getContainer().getId(),
                      sc.getComponent().getId()));
    };
  }
}
