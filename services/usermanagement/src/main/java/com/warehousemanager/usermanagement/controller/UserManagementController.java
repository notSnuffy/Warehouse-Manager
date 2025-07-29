package com.warehousemanager.usermanagement.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserManagementController {

  @GetMapping("/users")
  public String getAllUsers() {
    return "Hello, this is the User Management Service!";
  }
}
