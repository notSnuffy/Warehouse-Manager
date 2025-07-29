package com.warehousemanager.gateway;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class GatewayApplication {
  @Value("${user.interface.url}")
  private String userInterfaceUrl;

  @Bean
  public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
    return builder
        .routes()
        .route(
            "shape-management",
            r ->
                r.path("/shape-management/**")
                    .filters(f -> f.rewritePath("/shape-management/(?<segment>.*)", "/${segment}"))
                    .uri("lb://shape-management"))
        .route(
            "furniture-management",
            r ->
                r.path("/furniture-management/**")
                    .filters(
                        f -> f.rewritePath("/furniture-management/(?<segment>.*)", "/${segment}"))
                    .uri("lb://furniture-management"))
        .route(
            "floor-management",
            r ->
                r.path("/floor-management/**")
                    .filters(f -> f.rewritePath("/floor-management/(?<segment>.*)", "/${segment}"))
                    .uri("lb://floor-management"))
        .route(
            "item-management",
            r ->
                r.path("/item-management/**")
                    .filters(f -> f.rewritePath("/item-management/(?<segment>.*)", "/${segment}"))
                    .uri("lb://item-management"))
        .route(
            "user-management",
            r ->
                r.path("/user-management/**")
                    .filters(f -> f.rewritePath("/user-management/(?<segment>.*)", "/${segment}"))
                    .uri("lb://user-management"))
        .route(
            "user-interface",
            r ->
                r.path("/**")
                    .filters(f -> f.rewritePath("/(?<segment>.*)", "/${segment}"))
                    .uri(userInterfaceUrl))
        .build();
  }

  public static void main(String[] args) {
    SpringApplication.run(GatewayApplication.class, args);
  }
}
