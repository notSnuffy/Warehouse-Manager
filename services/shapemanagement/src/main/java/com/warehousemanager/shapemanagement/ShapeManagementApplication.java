package com.warehousemanager.shapemanagement;

import com.warehousemanager.shapemanagement.entities.Shape;
import com.warehousemanager.shapemanagement.entities.ShapeInstance;
import com.warehousemanager.shapemanagement.repositories.ShapeInstanceRepository;
import com.warehousemanager.shapemanagement.repositories.ShapeRepository;
import java.util.Arrays;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ShapeManagementApplication {
  private static final Logger logger = LoggerFactory.getLogger(ShapeManagementApplication.class);
  private static final Long RECTANGLE_ID = 1L;
  private static final Long ELLIPSE_ID = 2L;
  private static final Long ARC_ID = 3L;
  private static final Long POLYGON_ID = 4L;

  public static void main(String[] args) {
    SpringApplication.run(ShapeManagementApplication.class, args);
  }

  @Bean
  public CommandLineRunner commandLineRunner(
      ShapeRepository shapeRepository, ShapeInstanceRepository shapeInstanceRepository) {
    return args -> {
      logger.info("Shape Management Application started successfully.");

      Shape rectangle = new Shape(RECTANGLE_ID, "Rectangle", ShapeType.RECTANGLE);
      rectangle.setPublic(false);
      shapeRepository.save(rectangle);

      logger.info("Shape saved with ID: {}", rectangle.getId());
      logger.info("Shape saved with Version: {}", rectangle.getVersion());

      ShapeParameters rectangleParameters = new ShapeParameters();
      rectangleParameters.positionX = 0;
      rectangleParameters.positionY = 0;
      rectangleParameters.width = 100.0;
      rectangleParameters.height = 100.0;

      Instruction rectangleInstruction = new Instruction("CREATE_RECTANGLE", rectangleParameters);

      ShapeInstance rectangleInstance =
          new ShapeInstance(
              rectangle.getId(), rectangle.getVersion(), Arrays.asList(rectangleInstruction));
      rectangleInstance.setTemplate(true);
      shapeInstanceRepository.save(rectangleInstance);

      Shape ellipse = new Shape(ELLIPSE_ID, "Ellipse", ShapeType.ELLIPSE);
      ellipse.setPublic(false);
      shapeRepository.save(ellipse);

      ShapeParameters ellipseParameters = new ShapeParameters();
      ellipseParameters.positionX = 0;
      ellipseParameters.positionY = 0;
      ellipseParameters.width = 100.0;
      ellipseParameters.height = 100.0;

      Instruction ellipseInstruction = new Instruction("CREATE_ELLIPSE", ellipseParameters);

      ShapeInstance ellipseInstance =
          new ShapeInstance(
              ellipse.getId(), ellipse.getVersion(), Arrays.asList(ellipseInstruction));
      ellipseInstance.setTemplate(true);
      shapeInstanceRepository.save(ellipseInstance);

      Shape arc = new Shape(ARC_ID, "Arc", ShapeType.ARC);
      arc.setPublic(false);
      shapeRepository.save(arc);

      ShapeParameters arcParameters = new ShapeParameters();
      arcParameters.positionX = 0;
      arcParameters.positionY = 0;
      arcParameters.width = 100.0;
      arcParameters.height = 100.0;
      arcParameters.arcRadius = 50.0;
      arcParameters.arcStartAngle = 0.0;
      arcParameters.arcEndAngle = 180.0;

      Instruction arcInstruction = new Instruction("CREATE_ARC", arcParameters);

      ShapeInstance arcInstance =
          new ShapeInstance(arc.getId(), arc.getVersion(), Arrays.asList(arcInstruction));
      arcInstance.setTemplate(true);
      shapeInstanceRepository.save(arcInstance);

      Shape polygon = new Shape(POLYGON_ID, "Polygon", ShapeType.POLYGON);
      polygon.setPublic(false);
      shapeRepository.save(polygon);

      ShapeParameters polygonParameters = new ShapeParameters();
      polygonParameters.positionX = 0;
      polygonParameters.positionY = 0;
      polygonParameters.polygonPoints = Arrays.asList(0.0, 0.0, 50.0, 0.0, 50.0, 50.0, 0.0, 0.0);
      polygonParameters.width = 50.0;
      polygonParameters.height = 50.0;

      Instruction polygonInstruction = new Instruction("CREATE_POLYGON", polygonParameters);

      ShapeInstance polygonInstance =
          new ShapeInstance(
              polygon.getId(), polygon.getVersion(), Arrays.asList(polygonInstruction));
      polygonInstance.setTemplate(true);
      shapeInstanceRepository.save(polygonInstance);
    };
  }
}
