package com.warehousemanager.furnituremanagement.controller;

import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

@RestController
public class FurnitureManagementController {

  private final DiscoveryClient discoveryClient;
  private final RestClient restClient;

  public FurnitureManagementController(
      DiscoveryClient discoveryClient, RestClient.Builder restClientBuilder) {
    this.discoveryClient = discoveryClient;
    this.restClient = restClientBuilder.build();
  }

  @GetMapping("/Eureka")
  public String getFurniture() {
    ServiceInstance serviceInstance = discoveryClient.getInstances("shape-management").get(0);
    String url = serviceInstance.getUri() + "/shapes";
    String response = restClient.get().uri(url).retrieve().body(String.class);
    return "Furniture Management Service: " + response;
  }
}
