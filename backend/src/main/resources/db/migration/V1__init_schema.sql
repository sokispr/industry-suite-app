-- 1. Role Categories (Crew Folders)
CREATE TABLE role_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE
);

-- 2. Roles (Crew Types)
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    display_name VARCHAR(120) NOT NULL,
    category_id BIGINT,
    color_hex VARCHAR(7) NOT NULL DEFAULT '#4f46e5',
    system_role BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_roles_category FOREIGN KEY (category_id) REFERENCES role_categories(id) ON DELETE SET NULL
);

-- 3. Employees (Crew Members)
CREATE TABLE employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    email VARCHAR(120) UNIQUE,
    phone VARCHAR(30),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Employee Roles (Link Table)
CREATE TABLE employee_roles (
    employee_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (employee_id, role_id),
    CONSTRAINT fk_employee_roles_employee FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
    CONSTRAINT fk_employee_roles_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
);

-- 5. Planned Events (Projects)
CREATE TABLE planned_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    description TEXT,
    location VARCHAR(140),
    event_type VARCHAR(30) NOT NULL DEFAULT 'EXTERNAL',
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,
    color_hex VARCHAR(7),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_planned_events_time_window CHECK (end_at > start_at)
);

-- 6. Event Assignments (Crew working on a Project)
CREATE TABLE event_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    duty_role VARCHAR(120),
    notes VARCHAR(255),
    shift_start_at DATETIME,
    shift_end_at DATETIME,
    CONSTRAINT fk_event_assignments_event FOREIGN KEY (event_id) REFERENCES planned_events (id) ON DELETE CASCADE,
    CONSTRAINT fk_event_assignments_employee FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE RESTRICT
);

-- 7. Warehouses (Multi-location support)
CREATE TABLE warehouses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    location VARCHAR(140)
);

-- 8. Inventory Categories (Warehouse Folders)
CREATE TABLE inventory_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE
);

-- 9. Inventory Items (Warehouse Stock)
CREATE TABLE inventory_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(60) NOT NULL UNIQUE,
    name VARCHAR(180) NOT NULL,
    category_id BIGINT,
    warehouse_id BIGINT NOT NULL,
    quantity_total INT NOT NULL DEFAULT 0,
    quantity_reserved INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_inventory_quantities CHECK (
        quantity_total >= 0
        AND quantity_reserved >= 0
        AND quantity_reserved <= quantity_total
    ),
    CONSTRAINT fk_inventory_items_category FOREIGN KEY (category_id) REFERENCES inventory_categories (id) ON DELETE SET NULL,
    CONSTRAINT fk_inventory_items_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses (id) ON DELETE RESTRICT
);

-- 10. Event Equipment Registers (Gear booked for a Project)
CREATE TABLE event_equipment_registers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    inventory_item_id BIGINT NOT NULL,
    quantity_reserved INT NOT NULL,
    notes VARCHAR(255),
    CONSTRAINT fk_event_equipment_event FOREIGN KEY (event_id) REFERENCES planned_events(id) ON DELETE CASCADE,
    CONSTRAINT fk_event_equipment_item FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE RESTRICT
);

-- 11. Serialized Units (For specific item tracking - Barcodes)
CREATE TABLE serialized_units (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT NOT NULL,
    serial_number VARCHAR(120) NOT NULL UNIQUE,
    notes VARCHAR(255),
    CONSTRAINT fk_serialized_units_item FOREIGN KEY (item_id) REFERENCES inventory_items (id) ON DELETE CASCADE
);
