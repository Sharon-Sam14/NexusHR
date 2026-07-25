# Contributing Guidelines — NexusHR

Thank you for contributing to **NexusHR**. Please adhere to these guidelines when submitting pull requests.

---

## 1. Branching Strategy

We use a standard branching model:
*   `main` ── Production-ready code.
*   `dev` ── Integration branch for new features.
*   `feature/<name>` ── New feature developments.
*   `bugfix/<name>` ── General bug fixes.

---

## 2. Coding Conventions

### 2.1 Java Backend
*   **Decoupling**: Implement business logic in service files (`*ServiceImpl.java`), keeping controller classes focused on routing.
*   **Transactions**: Annotate service methods that write to multiple tables with `@Transactional`.
*   **Validation**: Validate request bodies at the controller level using `@Valid`.

### 2.2 React Frontend
*   **State Management**: Avoid global states for local inputs. Use local React states.
*   **Components**: Keep UI components modular. Save reusable components under `src/components/`.

---

## 3. Pull Request (PR) Requirements
1.  **Branch Off**: Create your feature branch off `dev`.
2.  **Lint & Test**: Ensure all tests compile and execute cleanly before submitting.
3.  **No Direct Pushes**: Do not push directly to `main`. Create a pull request for review.
