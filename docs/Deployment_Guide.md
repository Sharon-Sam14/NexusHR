# Local Setup & Production Deployment Guide

This document details the configuration, deployment, and rollback procedures for the **NexusHR** system in a local development environment or deploying it to production.

---

## 💻 Part 1: Local Development Setup

To run the application locally, ensure you have Java 21, Node.js (v18+), and a running instance of PostgreSQL.

### 1. Database Setup
1. Connect to your PostgreSQL server and create a database named `nexushr`:
   ```sql
   CREATE DATABASE nexushr;
   ```
2. For local development, the active profile should be `dev`. This configures the datasource and uses `ddl-auto=update` to create tables automatically.
   Configure your credentials in `backend/app/src/main/resources/application-dev.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/nexushr
   spring.datasource.username=postgres
   spring.datasource.password=123456
   ```

### 2. Backend Server Launch
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Build the Maven project to resolve dependencies:
   ```bash
   mvn clean compile
   ```
3. Start the Spring Boot application using the `dev` profile:
   ```bash
   mvn spring-boot:run -pl app -Dspring-boot.run.profiles=dev
   ```
   *The server will boot, automatically migrate the database schema, and seed default accounts. It listens on:* `http://localhost:8081`

### 3. Frontend Client Launch
1. Navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   *The client will compile and run locally. Access the UI at:* `http://localhost:5173`

---

## ☁️ Part 2: Production Deployments

### 1. Backend Assembly (Render + Neon PostgreSQL)

#### Render Web Service Configuration
- **GitHub Repository**: Connect your repository to Render.
- **Root Directory**: Leave blank (Render will parse the parent `pom.xml` at the root).
- **Environment**: `Java` (Java 21).
- **Build Command**: `cd backend && mvn clean package -DskipTests`
- **Start Command**: `java -jar backend/app/target/app-0.0.1-SNAPSHOT.jar`
- **Health Check Path**: `/api/health` (Exposed publicly without authentication; returns HTTP 200).
- **Infrastructure Declared**: Configured in root [render.yaml](file:///c:/Users/sharo/Desktop/NexusHR-main/render.yaml).

#### Neon PostgreSQL Setup
1. Create a project in your Neon console and copy the connection string.
2. Ensure `sslmode=require` is present in the connection URL.
3. Configure connection pooling in Render: since Neon serverless DB closes idle connections after 5 minutes, our prod profile pool size is tuned to `max-pool-size=5` and `idle-timeout=300000` inside `application-prod.properties`.

#### Production Environment Variables (Render Dashboard)
Configure the following keys in your Render service dashboard under the **Environment** tab:

| Variable Name | Description | Value |
| :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `prod` |
| `DB_URL` | Neon Connection String | `jdbc:postgresql://YOUR_NEON_HOST/nexushr?sslmode=require` |
| `DB_USERNAME` | Neon DB Username | `YOUR_NEON_USERNAME` |
| `DB_PASSWORD` | Neon DB Password | `YOUR_NEON_PASSWORD` |
| `JWT_SECRET` | 256-bit signature key | `YOUR_CRYPTOGRAPHICALLY_SECURE_JWT_SECRET` (min 32 chars) |
| `FRONTEND_URL` | Vercel Client URL | `https://YOUR_VERCEL_URL` (no trailing slash) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Storage | `YOUR_CLOUD_NAME` (optional) |
| `CLOUDINARY_API_KEY` | Cloudinary Storage | `YOUR_API_KEY` (optional) |
| `CLOUDINARY_API_SECRET` | Cloudinary Storage | `YOUR_API_SECRET` (optional) |

---

### 2. Frontend Assembly (Vercel)

#### Vercel Configuration
Vercel is configured using [vercel.json](file:///c:/Users/sharo/Desktop/NexusHR-main/frontend/vercel.json) in the `frontend` folder. It provides:
1. **API Proxy Rewrite**: Automatically routes all requests from `/api/:path*` to `YOUR_RENDER_URL/api/:path*`.
2. **SPA Routing rewrite**: Redirects all other page requests to `/index.html` so client-side React Router handles them natively.

#### Vercel Project Settings
- **Root Directory**: `frontend` (Ensure this is set during Vercel import).
- **Framework Preset**: `Vite` (Vercel automatically detects Vite).
- **Build Command**: `npm run build`
- **Output Directory**: `dist` (default Vite output).
- **Environment Variables**:
  - `VITE_API_BASE_URL`: `https://YOUR_RENDER_URL` (optional - backup configuration for the client environment).

---

### 3. Cloudinary Setup (Media Storage)
1. Register for a free account at [Cloudinary](https://cloudinary.com).
2. Copy your Cloud Name, API Key, and API Secret from the Console dashboard.
3. Input these values as the environment variables (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`) on Render.
4. If left blank, the application automatically falls back to safe local mock uploads storing files under the `uploads/` folder.

---

## 🔄 Part 3: Reversibility & Rollback Procedures

Every production deployment step is fully reversible. If a deployment fails or causes regressions, execute the following restore procedures.

### 1. Database Rollback
If a schema change causes errors (under `spring.jpa.hibernate.ddl-auto=validate`):
- **Action**: Neon provides instant point-in-time recovery via Branching.
- **Rollback Steps**:
  1. Open Neon dashboard -> Branches.
  2. Select the main branch, choose **Reset branch to point-in-time**.
  3. Enter the timestamp preceding the deployment and click **Reset**.
  4. The database is instantly restored to its previous configuration.

### 2. Backend Web Service Rollback (Render)
If a backend deployment introduces bugs:
- **Action**: Render stores history of compiled builds.
- **Restore Procedure**:
  1. Go to Render Dashboard -> Select `nexushr-backend`.
  2. Click on **Events** or **Deploys**.
  3. Locate the previous successful deploy, click the three dots (`...`), and select **Rollback to this deploy**.
  4. The backend service will instantly redeploy the older successful Docker/JAR image.

### 3. Frontend Client Rollback (Vercel)
If a frontend layout breaks:
- **Action**: Vercel keeps permanent preview URLs and deployment history.
- **Restore Procedure**:
  1. Go to Vercel Dashboard -> Select your project.
  2. Click on **Deployments**.
  3. Locate the previous working deployment, click the vertical dots, and select **Promote to Production**.
  4. Vercel will instantly shift production domain routes back to the previous static bundle without rebuilds.

---

## 🛠️ Part 4: Production Troubleshooting & Checks

### 1. CORS Mismatch Errors
- **Symptom**: Console prints `CORS policy blocked request`.
- **Cause**: The `FRONTEND_URL` environment variable set on Render does not exactly match the domain of your Vercel deployment (or is missing protocol/has trailing slash).
- **Fix**: Check `FRONTEND_URL` value on Render and ensure it has no trailing slash (e.g. `https://nexushr.vercel.app`).

### 2. JWT Key Too Short
- **Symptom**: Backend boot fails with `WeakKeyException`.
- **Cause**: The `JWT_SECRET` variable is shorter than 256 bits (32 characters).
- **Fix**: Generate a secure 64-character hex key and update `JWT_SECRET` environment variable.

---

## 🧪 Part 5: Production Smoke Test Checklist

After completing the cloud deployment, execute this verification checklist before declaring the release successful:

1. **Verify Health Endpoint**:
   - Query `GET https://YOUR_RENDER_URL/api/health`
   - Verify HTTP `200 OK` is returned.
   - Verify the response format matches:
     ```json
     {
       "status": "UP",
       "service": "NexusHR",
       "timestamp": "2026-07-31T18:56:48Z",
       "version": "0.0.1-SNAPSHOT"
     }
     ```
2. **Execute Critical Workflows**:
   - **Login**: Authenticate using administrator credentials configured for your deployment environment.
   - **Create Department**: Navigate to Departments -> Add a new department.
   - **Create Employee**: Add a new employee profile associated with the new department.
   - **Upload File**: Apply for SICK leave and upload a sample medical certificate PDF (confirms Cloudinary storage connection).
   - **Download File**: Preview and download the uploaded leave certificate (confirms Relative API pathing and proxy rewrites).
   - **Generate Payroll**: Navigate to Payroll -> Generate individual payslip.
   - **Logout**: Confirm the session is destroyed and tokens are correctly revoked.