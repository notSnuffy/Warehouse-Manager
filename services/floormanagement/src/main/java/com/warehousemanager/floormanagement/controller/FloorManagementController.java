package com.warehousemanager.floormanagement.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FloorManagementController {
  @GetMapping("/floors")
  public String getAllFloors() {
    return "Hello, this is the Floor Management Service!";
  }
}
