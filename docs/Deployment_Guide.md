# Local Setup & Production Deployment Guide

This document details the configuration and deployment procedures for setting up the **NexusHR** system in a local development environment or deploying it to production.

---

## 💻 Part 1: Local Development Setup

To run the application locally, ensure you have Java 21, Node.js (v18+), and a running instance of PostgreSQL.

### 1. Database Setup
1.  Connect to your PostgreSQL server and create a database named `nexushr`:
    ```sql
    CREATE DATABASE nexushr;
    ```
2.  Open `backend/app/src/main/resources/application.properties` and verify your connection parameters:
    ```properties
    spring.datasource.url=jdbc:postgresql://localhost:5432/nexushr
    spring.datasource.username=your_postgres_username
    spring.datasource.password=your_postgres_password
    ```

### 2. Backend Server Launch
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Build the Maven project to resolve dependencies:
    ```bash
    mvn clean compile
    ```
3.  Start the Spring Boot application:
    ```bash
    mvn spring-boot:run -pl app
    ```
    *The server will boot, automatically migrate the PostgreSQL database schema, and seed default user accounts. It will be listening on:* `http://localhost:8081`

### 3. Frontend Client Launch
1.  Navigate to the `frontend` directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Launch the Vite development server:
    ```bash
    npm run dev
    ```
    *The client will compile and load locally. Access the UI at:* `http://localhost:5173`

---

## ☁️ Part 2: Production Deployments

When deploying to cloud platforms, the backend is built into an executable JAR, and the frontend is bundled into optimized static assets.

### 1. Backend Production Assembly (JAR)
Assemble the production package using the Maven command:
```bash
mvn clean package -DskipTests
```
This compiles the classes and saves the executable archive `app-0.0.1-SNAPSHOT.jar` inside the `backend/app/target/` directory. You can run it on any server utilizing:
```bash
java -jar app/target/app-0.0.1-SNAPSHOT.jar
```

### 2. Frontend Production Build (HTML/JS/CSS Bundle)
Generate the optimized client assets inside the `frontend` folder:
```bash
npm run build
```
This builds your React Single Page Application and outputs minified static assets to the `frontend/dist/` folder, ready to be served by any static file hosting service or web proxy server (like Nginx).

---

## 🐳 Part 3: Containerization with Docker

We package the entire multi-service layout using Docker and coordinate container starts using Docker Compose.

### 1. Dockerfile for Spring Boot Backend
Create a `Dockerfile` inside the `backend/` directory:
```dockerfile
FROM openjdk:21-slim
VOLUME /tmp
COPY app/target/app-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

### 2. Docker Compose Configuration
Combine services into a single execution context:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: nexushr_db
    environment:
      POSTGRES_DB: nexushr
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: production_password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    container_name: nexushr_backend
    ports:
      - "8081:8081"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/nexushr
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: production_password
    depends_on:
      - postgres
    volumes:
      - ./uploads:/uploads

volumes:
  pgdata:
```

Launch the multi-container structure with:
```bash
docker compose up --build -d
```