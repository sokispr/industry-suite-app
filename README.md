# Industry Operations Suite

This is a full-stack ERP (Enterprise Resource Planning) system designed for managing events, crew, and inventory for the production industry. It's built with a modern Java (Spring Boot) backend and a vanilla JavaScript Single Page Application (SPA) frontend.

## Core Architecture

The project is divided into two main parts: `backend` and `frontend`.

### Backend (`/backend`)

The backend is a Spring Boot application responsible for all business logic, data validation, and communication with the MySQL database.

- **Technology**: Java 21, Spring Boot 3, Spring Data JPA (Hibernate), MySQL.
- **Database Migrations**: `Flyway` is used to manage database schema changes. All schema files are located in `src/main/resources/db/migration`.
- **Structure**: The code is organized by "domain" (e.g., `events`, `employees`, `inventory`). Each domain typically contains:
    - `Controller`: Exposes REST API endpoints (e.g., `/api/events`).
    - `Service`: Contains the core business logic (e.g., checking for availability, validating data).
    - `Repository`: Handles database operations (e.g., `findAll`, `save`).
    - `Entity`: A Java class that maps to a database table.
    - `dto`: Data Transfer Objects used for API requests and responses.

### Frontend (`/frontend`)

The frontend is a high-performance **Single Page Application (SPA)**. This means the application loads only once, and all subsequent "page" changes are handled instantly by JavaScript without a full browser refresh. This provides a fast, native-app-like experience.

- **Technology**: Vanilla JavaScript (ES6 Modules), HTML5, CSS3, Bootstrap 5.
- **No Framework**: The frontend is intentionally built without a heavy framework like React or Angular to ensure maximum performance, minimal dependencies, and full control over the code.
- **File Structure**:
    - `index.html`: The single entry point for the entire application. It contains the layout and all the "view panes" (sections that are shown/hidden).
    - `css/`: Contains all styling. `styles.css` has global styles, while other files handle specific components like the calendar or modals.
    - `js/`: Contains all the application logic.
        - `app.js`: The main "conductor". It initializes the app, handles routing (via URL hash), and orchestrates calls to other modules.
        - `api.js`: The only file that communicates with the backend REST API.
        - `state.js`: Acts as the in-memory "RAM" of the application, holding all the data (events, crew, etc.) for instant access.
        - `render.js`: Contains functions that take data from `state.js` and "paint" it into the HTML (e.g., building tables, stats).
        - Other files (`events.js`, `crew.js`, etc.) contain the logic for specific features, like handling the "Add Project" modal.

## How to Run

1.  **Backend**:
    - Make sure you have a MySQL server running.
    - Configure the database credentials in `backend/src/main/resources/application.yml`.
    - Navigate to the `backend` directory and run `mvn spring-boot:run`.
    - The server will start, typically on port `8081`.

2.  **Frontend**:
    - You need a simple live server to serve the `frontend` directory.
    - A popular choice is the "Live Server" extension for VS Code.
    - Right-click on `index.html` and choose "Open with Live Server".
    - The application will open in your browser, typically at `http://localhost:5500`.

---
