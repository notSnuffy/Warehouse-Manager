package com.warehousemanager.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class GatewayApplication {
  @Bean
  public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
    return builder
        .routes()
        .route(
            "furniture-management",
            r ->
                r.path("/furniture-management/**")
                    .filters(
                        f -> f.rewritePath("/furniture-management/(?<segment>.*)", "/${segment}"))
                    .uri("lb://furniture-management"))
        .route(
            "shape-management",
            r ->
                r.path("/shape-management/**")
                    .filters(f -> f.rewritePath("/shape-management/(?<segment>.*)", "/${segment}"))
                    .uri("lb://shape-management"))
        .build();
  }

  public static void main(String[] args) {
    SpringApplication.run(GatewayApplication.class, args);
  }
}
