package com.warehousemanager.shapemanagement;

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
    };
  }
}
