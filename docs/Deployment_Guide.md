# Local Setup & Production Deployment Guide

This document details the configuration and deployment procedures for setting up the **NexusHR** system in a local development environment or deploying it to production.

---

## 💻 Part 1: Local Development Setup

To run the application locally, ensure you have Java 22, Node.js (v18+), and a running instance of PostgreSQL.

### 1. Database Setup
1.  Connect to your PostgreSQL server and create a database named `nexushr`:
    ```sql
    CREATE DATABASE nexushr;
    ```
2.  Open `backend/src/main/resources/application.properties` and verify your connection parameters:
    ```properties
    spring.datasource.url=jdbc:postgresql://localhost:5432/nexushr
    spring.datasource.username=your_postgres_username
    spring.datasource.password=your_postgres_password
    ```

---

### 2. Backend Server Launch
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Build the Maven project to resolve dependencies:
    ```bash
    ./mvnw clean compile
    ```
3.  Start the Spring Boot application:
    ```bash
    ./mvnw spring-boot:run
    ```
    *The server will boot, automatically migrate the PostgreSQL database schema, and seed default user accounts. It will be listening on:* `http://localhost:8081`

---

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
./mvnw clean package -DskipTests
```
This compiles the classes and saves the executable archive `backend-0.0.1-SNAPSHOT.jar` inside the `backend/target/` directory. You can run it on any server utilizing:
```bash
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### 2. Frontend Production Build (HTML/JS/CSS Bundle)
Generate the optimized client assets inside the `frontend` folder:
```bash
npm run build
```
This builds your React Single Page Application and outputs minified static assets to the `frontend/dist/` folder, ready to be served by any static file hosting service or web proxy server (like Nginx).

---

## 🔑 Environment Variables & Security Configuration

When deploying to cloud providers (e.g. Render, Supabase, Vercel), overwrite properties using environment variables:

| Property Name | Environment Variable Override | Description |
| :--- | :--- | :--- |
| `spring.datasource.url` | `SPRING_DATASOURCE_URL` | JDBC database connection URI |
| `spring.datasource.username` | `SPRING_DATASOURCE_USERNAME` | PostgreSQL database user username |
| `spring.datasource.password` | `SPRING_DATASOURCE_PASSWORD` | PostgreSQL database user password |
| `jwt.secret` | `JWT_SECRET` | 256-bit cryptographically secure token signing key |
| `jwt.expiration` | `JWT_EXPIRATION` | Session lifetime parameter in milliseconds |
| `server.port` | `PORT` | Listening network port of the Spring Boot application |