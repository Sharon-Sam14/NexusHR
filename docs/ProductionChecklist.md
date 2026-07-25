# Production Deployment Checklist — NexusHR

Verify that all checklist items are met before deploying the **NexusHR** system to a production environment.

---

## 1. Security Configurations
*   [ ] **JWT Secrets**: Replace the default `jwt.secret` signing key with a 256-bit cryptographically secure key.
*   [ ] **Stateless Token Expire Settings**: Verify that `jwt.expiration` is set to a reasonable expiration time (e.g. 24 hours).
*   [ ] **Database Credentials**: Change the default username and password for the PostgreSQL database in `application.properties`.
*   [ ] **Security Config Verification**: Verify that only public routes (like `/api/auth/**`) are accessible without authentication.
*   [ ] **Disable DB Seeding**: Disable `DataSeeder.java` in production to prevent demo data from overwriting live tables.

---

## 2. Infrastructure & Operations
*   [ ] **Port Assignment**: Verify that the application uses the environment-defined port (`PORT`).
*   [ ] **Local Directory Setup**: Verify that the `./uploads/` directory has write permissions.
*   [ ] **Nginx Reverse Proxy**: Configure Nginx as a reverse proxy to manage SSL termination (HTTPS) and serve frontend static assets.
*   [ ] **Logging Configuration**: Set the Spring Boot logging level to `INFO` or `WARN` in `application.properties` to reduce log files volume.
*   [ ] **PostgreSQL Backups**: Schedule automated database backups (e.g. using `pg_dump`).
