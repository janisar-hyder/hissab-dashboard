# Hissab Dashboard - Frontend Documentation

This document outlines the technology stack, libraries, and architectural decisions used in the Hissab Dashboard frontend.

## 🚀 Core Technology Stack

- **Framework**: [Angular](https://angular.dev/) (v21.1.x) - A platform for building mobile and desktop web applications.
- **Language**: [TypeScript](https://www.typescriptlang.org/) (v5.9.x) - A strongly typed programming language that builds on JavaScript.
- **Styling**: **SCSS (Sass)** - Used for global and component-level styling, utilizing CSS variables for theme consistency (colors, typography, spacing).
- **HTML/Templates**: Angular HTML templates for structural markup.

## 📦 Key Libraries & Dependencies

### Built-in Angular Packages
- `@angular/common`, `@angular/compiler`, `@angular/core`: The foundational building blocks of the Angular framework.
- `@angular/forms`: Forms module for handling user input, form validation, and state management (Template-driven and Reactive forms).
- `@angular/router`: Angular's routing and navigation engine for single-page application (SPA) functionality.
- `@angular/platform-browser`: Tools necessary to run Angular applications in a web browser.

### UI & Component Libraries
- **@angular/cdk (Component Dev Kit)** (v21.1.x): Used heavily for building custom, accessible, and high-performance UI components. Specifically used for:
  - **Drag and Drop (`@angular/cdk/drag-drop`)**: Implemented in modular areas like the "Manage Columns" side panel.
  - **Overlays/Portals**: For building robust modals, side panels, and dropdown menus.

### Reactive Programming
- **RxJS** (v7.8.x): A library for reactive programming using Observables, to make it easier to compose asynchronous or callback-based code. Used extensively in Angular for HTTP requests, event handling, and state observation.

### Utilities
- **TSLib** (v2.3.x): Runtime library for TypeScript helper functions.

## 🛠 Features & Implementations

1. **Custom UI Components**: The project relies on custom-built UI primitives (e.g., `app-button`, modals) rather than heavy third-party component libraries (like Material or Bootstrap) to ensure total design control and pixel-perfection matching Figma bounds.
2. **Icons**: Uses custom SVG assets (located in `public/icons/`) combined with CSS Masking (`-webkit-mask-image`) to easily recolor icons via CSS `currentColor` or specific brand colors. Also utilizes some Line Awesome icon font classes (`las la-*`).
3. **Advanced CSS Patterns**:
   - Substantial use of CSS Variables (`:root`) in `styles.scss` for theming (Colors, Box Shadows, Border Radiuses, Spacing).
   - Flexbox and CSS Grid for layout structuring.
4. **Standalone Components**: Leveraging modern Angular structure, the project utilizes Standalone Components (reducing reliance on `NgModules`).

## ⚙️ Development Environment

- **Node Package Manager**: `npm` (v10.9.x)
- **Angular CLI**: `@angular/cli` (v21.1.x) used for generating components, services, building, and serving the app via local dev server.
- **TypeScript Compiler**: `@angular/compiler-cli` for translating TS to JS.

## 🏃‍♂️ Running the Project

To start the development server, run:
```bash
npm start
```
Or use the Angular CLI directly:
```bash
ng serve
```
Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.
