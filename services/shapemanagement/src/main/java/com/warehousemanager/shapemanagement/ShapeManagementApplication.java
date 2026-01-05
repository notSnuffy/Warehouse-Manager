package com.warehousemanager.shapemanagement;

import com.warehousemanager.shapemanagement.repositories.ShapeInstanceRepository;
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

  // private static final Long RECTANGLE_ID = 1L;
  // private static final Long ELLIPSE_ID = 2L;
  // private static final Long ARC_ID = 3L;
  // private static final Long POLYGON_ID = 4L;

  public static void main(String[] args) {
    SpringApplication.run(ShapeManagementApplication.class, args);
  }

  // private void createSystemShapes(
  //    ShapeRepository shapeRepository,
  //    ShapeInstanceRepository shapeInstanceRepository,
  //    Long id,
  //    String name,
  //    ShapeType type,
  //    Instruction instruction) {
  //  Shape shape = new Shape(id, name, type);
  //  shape.setPublic(false);

  //  if (shapeRepository.existsByIdEquals(id)) {
  //    logger.info("Shape with ID {} already exists. Skipping creation.", id);
  //    return;
  //  }

  //  shapeRepository.save(shape);

  //  ShapeInstance shapeInstance =
  //      new ShapeInstance(shape.getId(), shape.getVersion(), Arrays.asList(instruction));
  //  shapeInstance.setTemplate(true);
  //  shapeInstanceRepository.save(shapeInstance);
  // }

  @Bean
  public CommandLineRunner commandLineRunner(
      ShapeRepository shapeRepository, ShapeInstanceRepository shapeInstanceRepository) {
    return args -> {
      logger.info("Shape Management Application started successfully.");
      //
      //      ShapeParameters rectangleParameters = new ShapeParameters();
      //      rectangleParameters.positionX = 0;
      //      rectangleParameters.positionY = 0;
      //      rectangleParameters.width = 100.0;
      //      rectangleParameters.height = 100.0;
      //
      //      Instruction rectangleInstruction = new Instruction("CREATE_RECTANGLE",
      // rectangleParameters);
      //      createSystemShapes(
      //          shapeRepository,
      //          shapeInstanceRepository,
      //          RECTANGLE_ID,
      //          "Rectangle",
      //          ShapeType.RECTANGLE,
      //          rectangleInstruction);
      //
      //      ShapeParameters ellipseParameters = new ShapeParameters();
      //      ellipseParameters.positionX = 0;
      //      ellipseParameters.positionY = 0;
      //      ellipseParameters.width = 100.0;
      //      ellipseParameters.height = 100.0;
      //
      //      Instruction ellipseInstruction = new Instruction("CREATE_ELLIPSE", ellipseParameters);
      //      createSystemShapes(
      //          shapeRepository,
      //          shapeInstanceRepository,
      //          ELLIPSE_ID,
      //          "Ellipse",
      //          ShapeType.ELLIPSE,
      //          ellipseInstruction);
      //
      //      ShapeParameters arcParameters = new ShapeParameters();
      //      arcParameters.positionX = 0;
      //      arcParameters.positionY = 0;
      //      arcParameters.width = 100.0;
      //      arcParameters.height = 100.0;
      //      arcParameters.arcRadius = 50.0;
      //      arcParameters.arcStartAngle = 0.0;
      //      arcParameters.arcEndAngle = 180.0;
      //
      //      Instruction arcInstruction = new Instruction("CREATE_ARC", arcParameters);
      //      createSystemShapes(
      //          shapeRepository, shapeInstanceRepository, ARC_ID, "Arc", ShapeType.ARC,
      // arcInstruction);
      //
      //      ShapeParameters polygonParameters = new ShapeParameters();
      //      polygonParameters.positionX = 0;
      //      polygonParameters.positionY = 0;
      //      polygonParameters.polygonPoints = Arrays.asList(0.0, 0.0, 50.0, 0.0, 50.0, 50.0, 0.0,
      // 0.0);
      //      polygonParameters.width = 50.0;
      //      polygonParameters.height = 50.0;
      //
      //      Instruction polygonInstruction = new Instruction("CREATE_POLYGON", polygonParameters);
      //      createSystemShapes(
      //          shapeRepository,
      //          shapeInstanceRepository,
      //          POLYGON_ID,
      //          "Polygon",
      //          ShapeType.POLYGON,
      //          polygonInstruction);
    };
  }
}
