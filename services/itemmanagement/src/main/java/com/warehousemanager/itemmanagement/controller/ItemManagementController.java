package com.warehousemanager.itemmanagement.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ItemManagementController {
  @GetMapping("/items")
  public String getAllItems() {
    return "Hello, this is the Item Management Service!";
  }
}
