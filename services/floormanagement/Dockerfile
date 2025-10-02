FROM eclipse-temurin:21-jdk AS dependencies
WORKDIR /app
COPY .mvn/ .mvn                                                               
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY --from=dependencies /app /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw
COPY src src

CMD ["./mvnw", "spring-boot:run"]
