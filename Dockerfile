# ==========================================
# Dockerfile for Spring Boot modular monolith backend
# ==========================================

# Stage 1: Build the application using Maven
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy all source files and project definition
COPY backend/ /app/

# Build project and packages without running tests
RUN mvn clean package -DskipTests

# Stage 2: Create a minimal runner image
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy compiled JAR from build stage
COPY --from=build /app/app/target/app-0.0.1-SNAPSHOT.jar app.jar

# Expose Spring Boot default port (will be overridden by PORT environment variable on Render)
EXPOSE 8081

# Command to execute the application
ENTRYPOINT ["java", "-jar", "app.jar"]
