# AI Developer Rules & Guardrails

This document defines strict operational guidelines for AI developers modifying the **NexusHR** codebase. Adhere to these instructions to prevent regressions.

---

## 1. Code Modification Rules

### 1.1 Read Code Before Modifying
*   Always inspect relevant files using directory and file viewing tools before proposing changes. Do not write code based on assumptions about method or class names.

### 1.2 Verify Before Proposing Changes
*   Verify that your proposed changes compile cleanly and do not break existing business logic. Run tests locally.

### 1.3 Stay Within Project Scope
*   Do not rewrite existing code or introduce libraries unless explicitly requested. Focus your changes on the user's specific request.

### 1.4 Do Not Redesign
*   Maintain the existing architecture, UI layouts, colors, and styling choices. Do not perform ad-hoc refactoring.

---

## 2. API & Database Integrity Rules

### 2.1 Never Invent API Routes
*   Do not create endpoints or mock API routes that are not defined in the backend controller files.

### 2.2 Never Invent Database Fields
*   Do not add ad-hoc properties to DTOs or entities. Any changes to database fields must be mapped to SQL schema columns.

### 2.3 Always Preserve Compatibility
*   Ensure that changes to REST payloads do not break frontend services. Ensure backward compatibility for all API responses.

---

## 3. Deployment & Testing Rules

### 3.1 Always Test
*   Run unit and integration tests after making changes to verify functionality.

### 3.2 Do Not Push Code to GitHub
*   The actual command to push changes is reserved for the user. Do not execute Git push commands.

### 3.3 No Hallucinations
*   Only reference actual classes, files, endpoints, and variables present in the codebase.
