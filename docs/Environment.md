# NexusHR Environment & Configuration Guide

This document lists the environment variables, configuration properties, and defaults required to run the **NexusHR** system.

---

## 1. Environment variables Reference

| Variable Name | Default Value | Description |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/nexushr` | PostgreSQL connection URL. |
| `SPRING_DATASOURCE_USERNAME`| `postgres` | Database username. |
| `SPRING_DATASOURCE_PASSWORD`| `postgres` | Database password. |
| `JWT_SECRET` | `NexusHRSuperSecretKey2024ProductionGradeJWTKey!@#$%` | 256-bit token signing key. |
| `JWT_EXPIRATION` | `86400000` | Access token lifetime (default: 24 hours). |
| `PORT` | `8081` | Server port the backend application runs on. |

---

## 2. Directory Configurations

*   **File Upload Directory**: Document uploads are saved to `./uploads/` on the local file system. This directory is created automatically on startup.
*   **Artifact Directory**: Session logs and transcripts are stored in the local Gemini app directory (`~/.gemini/antigravity-ide/`).
