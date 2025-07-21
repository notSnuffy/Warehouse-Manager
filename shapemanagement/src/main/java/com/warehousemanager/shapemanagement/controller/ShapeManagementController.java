package com.warehousemanager.shapemanagement.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ShapeManagementController {

  @GetMapping("/shapes")
  public String getShapes() {
    return "List of shapes";
  }
}
