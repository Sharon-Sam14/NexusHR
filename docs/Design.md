# NexusHR UI Design Specification

This document defines the design patterns, typography rules, color tokens, and animation configurations for the **NexusHR** frontend application.

> [!WARNING]
> Do not modify the design tokens or styles defined in this file without explicit user permission.

---

## 1. Color Palette Tokens

The UI supports both dark and light modes, configured using CSS Custom Properties in `frontend/src/index.css`:

### 1.1 Brand Colors
*   **Brand Primary**: `var(--brand-primary)` ── HSL `(250, 84%, 54%)` (Deep Indigo)
*   **Brand Primary Soft**: `var(--brand-primary-soft)` ── HSL `(250, 84%, 95%)` / Dark `(250, 30%, 15%)`
*   **Brand Secondary**: `var(--brand-secondary)` ── HSL `(180, 70%, 40%)` (Teal)
*   **Brand Warning**: `var(--brand-warning)` ── HSL `(35, 90%, 55%)` (Orange/Amber)
*   **Brand Danger**: `var(--brand-danger)` ── HSL `(0, 84%, 60%)` (Red/Rose)

---

## 2. Typography & Fonts

We load fonts from Google Fonts:
*   **Display Font**: **Outfit** (`'Outfit', sans-serif`) — used for headers and titles.
*   **UI/Body Font**: **Inter** (`'Inter', sans-serif`) — used for details, forms, and normal text.
*   **Data Font**: **JetBrains Mono** (`'JetBrains Mono', monospace`) — used for data tables, metrics, and timestamps.

---

## 3. Glassmorphism & UI Accents

Cards and overlays use glassmorphism styling:
*   **Light Mode Glass**:
    ```css
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
    ```
*   **Dark Mode Glass**:
    ```css
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
    ```

---

## 4. Spacing System

Tailwind's spacing scale is strictly enforced:
*   **Grid Gap**: `gap-4` (`1rem`) or `gap-6` (`1.5rem`).
*   **Page Padding**: `p-6` (`1.5rem`) on desktop.
*   **Component Padding**: `p-4` (`1rem`) or `p-5` (`1.25rem`).

---

## 5. UI Animations (Framer Motion)

Animations use these constants:
*   **Page Transitions**:
    ```javascript
    const pageTransition = {
      initial: { opacity: 0, y: 15 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
      exit: { opacity: 0, y: -15, transition: { duration: 0.25 } }
    };
    ```
*   **Sidebar Toggle Transition**:
    ```javascript
    const sidebarTransition = {
      type: "spring",
      stiffness: 300,
      damping: 30
    };
    ```

---

## 6. Icons & Asset Styling

We use the `@phosphor-icons/react` icon pack:
*   Icons are styled using soft background badges, matching the icon color:
    ```html
    <div class="w-8 h-8 rounded bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
      <Clock size={16} />
    </div>
    ```
*   Icon weight is set to `regular` or `duotone` to maintain consistent styling.
