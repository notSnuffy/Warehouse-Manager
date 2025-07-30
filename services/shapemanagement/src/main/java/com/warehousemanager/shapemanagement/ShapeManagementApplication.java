package com.warehousemanager.shapemanagement;

import com.warehousemanager.shapemanagement.entities.Shape;
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
  public CommandLineRunner commandLineRunner(ShapeRepository shapeRepository) {
    return args -> {
      logger.info("Shape Management Application started successfully.");

      Shape rectangle = new Shape("Rectangle", ShapeType.RECTANGLE);
      rectangle.setPublic(false);
      shapeRepository.save(rectangle);

      Shape ellipse = new Shape("Ellipse", ShapeType.ELLIPSE);
      ellipse.setPublic(false);
      shapeRepository.save(ellipse);

      Shape arc = new Shape("Arc", ShapeType.ARC);
      arc.setPublic(false);
      shapeRepository.save(arc);

      Shape polygon = new Shape("Polygon", ShapeType.POLYGON);
      polygon.setPublic(false);
      shapeRepository.save(polygon);
    };
  }
}
