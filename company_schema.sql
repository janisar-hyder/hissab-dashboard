-- ==========================================
-- 1. PLATFORM ADMINISTRATION (Super Admin Side)
-- ==========================================

-- Super Admin Roles (Global platform roles)
CREATE TABLE super_admin_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'Active',
    
    -- Audit Columns
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL
);

-- Super Admin Role Permissions (Modular access per platform role)
CREATE TABLE super_admin_role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INT NOT NULL,
    module_name VARCHAR(150) NOT NULL,
    can_create BOOLEAN DEFAULT FALSE,
    can_view BOOLEAN DEFAULT TRUE,
    can_update BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    
    -- Audit Columns
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL,
    
    FOREIGN KEY (role_id) REFERENCES super_admin_roles(id) ON DELETE CASCADE
);

-- Super Admin Users (Platform employees/administrators)
CREATE TABLE super_admin_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    
    -- Audit Columns
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL, -- self-referential
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL,

    FOREIGN KEY (role_id) REFERENCES super_admin_roles(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES super_admin_users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES super_admin_users(id) ON DELETE SET NULL
);

-- Now link audit columns for super_admin_roles/permissions back to super_admin_users
ALTER TABLE super_admin_roles ADD FOREIGN KEY (created_by) REFERENCES super_admin_users(id) ON DELETE SET NULL;
ALTER TABLE super_admin_roles ADD FOREIGN KEY (updated_by) REFERENCES super_admin_users(id) ON DELETE SET NULL;
ALTER TABLE super_admin_role_permissions ADD FOREIGN KEY (created_by) REFERENCES super_admin_users(id) ON DELETE SET NULL;
ALTER TABLE super_admin_role_permissions ADD FOREIGN KEY (updated_by) REFERENCES super_admin_users(id) ON DELETE SET NULL;


-- ==========================================
-- 2. CLIENT MANAGEMENT (Tenant Side)
-- ==========================================

-- Main Clients Table (The Tenant)
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    client_num VARCHAR(50) NOT NULL UNIQUE, -- e.g., CLT-001
    name VARCHAR(255) NOT NULL,
    cr_num VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    
    -- Account Manager Details (Links to Super Admin Users)
    account_manager_id INT NULL, 
    
    -- Subscription Details
    billing_cycle VARCHAR(50),
    sub_model VARCHAR(50),
    num_users INT DEFAULT 1,
    sub_start_date DATE,
    sub_end_date DATE,
    hosting VARCHAR(50),
    amount DECIMAL(18,3),
    annual_maintenance_cost DECIMAL(18,3),
    cloud_charges DECIMAL(18,3),
    
    -- Localization
    default_language VARCHAR(50) DEFAULT 'English',
    time_zone VARCHAR(100) DEFAULT 'UTC+3:00',
    date_format VARCHAR(50),
    time_format VARCHAR(50),
    base_currency VARCHAR(10) DEFAULT 'BHD',
    currency_format VARCHAR(50),
    
    -- Branding & Credentials
    logo_path VARCHAR(512),
    admin_username VARCHAR(255) NOT NULL,
    admin_password VARCHAR(255) NOT NULL,
    remarks TEXT,
    
    -- Soft Delete & Status
    is_active BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMP NULL,
    
    -- Audit Columns (Links to Super Admin Users)
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL, 
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL,

    FOREIGN KEY (acc_mgr_id) REFERENCES super_admin_users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES super_admin_users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES super_admin_users(id) ON DELETE SET NULL
);


-- ==========================================
-- 3. CLIENT OPERATIONS (User & Role Side)
-- ==========================================

-- Client Roles (Scoped to client)
CREATE TABLE client_roles (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    
    -- Audit Columns (Set by Client Users)
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL,

    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    UNIQUE(client_id, name)
);

-- Client Role Permissions
CREATE TABLE client_role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INT NOT NULL,
    module_name VARCHAR(150) NOT NULL,
    can_create BOOLEAN DEFAULT FALSE,
    can_view BOOLEAN DEFAULT TRUE,
    can_update BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    
    -- Audit Columns
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL,
    
    FOREIGN KEY (role_id) REFERENCES client_roles(id) ON DELETE CASCADE
);

-- Client Users (The actual users of the business data)
CREATE TABLE client_users (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NULL, 
    status VARCHAR(50) DEFAULT 'Active',
    
    -- Audit Columns
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL, -- self-referential
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL,

    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES client_roles(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES client_users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES client_users(id) ON DELETE SET NULL,
    UNIQUE(client_id, email) -- Email unique per client
);

-- Now we link audit cols for client_roles back to client_users
ALTER TABLE client_roles ADD FOREIGN KEY (created_by) REFERENCES client_users(id) ON DELETE SET NULL;
ALTER TABLE client_roles ADD FOREIGN KEY (updated_by) REFERENCES client_users(id) ON DELETE SET NULL;


-- ==========================================
-- 4. BUSINESS DATA (Entity Side)
-- ==========================================

-- Client Contacts (Contact persons for the client itself)
CREATE TABLE client_contacts (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    designation VARCHAR(150),
    
    -- Audit Columns (Linked to Client Users)
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES client_users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES client_users(id) ON DELETE SET NULL
);

-- Client Permissions (Client-level subscription rights)
CREATE TABLE client_permissions (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL,
    module_name VARCHAR(150) NOT NULL,
    can_create BOOLEAN DEFAULT FALSE,
    can_view BOOLEAN DEFAULT TRUE,
    can_update BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    
    -- Audit Columns
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES client_users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES client_users(id) ON DELETE SET NULL
);

-- Customers
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    primary_contact VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    
    -- Additional info
    tax_treatment VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'BHD',
    opening_balance DECIMAL(18,3) DEFAULT 0.000,
    source_of_supply VARCHAR(255),
    payment_terms VARCHAR(100),
    
    -- Billing Address
    billing_attention VARCHAR(255),
    billing_country VARCHAR(100),
    billing_address TEXT,
    billing_city VARCHAR(100),
    
    -- Shipment Address
    shipment_attention VARCHAR(255),
    shipment_country VARCHAR(100),
    shipment_address TEXT,
    shipment_city VARCHAR(100),
    
    remarks TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMP NULL,
    
    -- Audit Columns
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES client_users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES client_users(id) ON DELETE SET NULL
);

-- Customer Contacts
CREATE TABLE customer_contacts (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    salutation VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    designation VARCHAR(150),
    
    -- Audit Columns
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES client_users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES client_users(id) ON DELETE SET NULL
);


-- ==========================================
-- 5. SEED DATA (INITIAL SETUP & TESTING)
-- ==========================================

-- A. SUPER ADMIN SIDE SEEDING
-- 1. Global Super Admin Role
INSERT INTO super_admin_roles (name, status) VALUES ('Admin', 'Active');

-- 2. Global Sys Admin User (Haha-1234)
INSERT INTO super_admin_users (name, email, password_hash, role_id) 
VALUES ('Sys Admin', 'admin@erp.com', 'Haha-1234', 1);

-- B. CLIENT SIDE SEEDING
-- 3. Test Client (Managed by Super Admin ID 1)
INSERT INTO clients (
    client_num, name, cr_num, email, phone, 
    admin_username, admin_password, acc_mgr_id, created_by
) VALUES (
    'CLT-001', 'Test Corporation', '123456-7', 'info@testcorp.com', '+973 17000000',
    'corp_admin', 'Pass-1234', 1, 1 
);

-- 4. Client Role for Test Corp (Client ID 1)
INSERT INTO client_roles (client_id, name, status) 
VALUES (1, 'Client Admin', 'Active');

-- 5. Client User for Test Corp (Client ID 1, Role ID 1)
INSERT INTO client_users (client_id, name, email, password_hash, role_id, status) 
VALUES (1, 'Test Client Admin', 'admin@testcorp.com', 'Haha-1234', 1, 'Active');
