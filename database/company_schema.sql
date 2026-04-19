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
    client_admin_username VARCHAR(255) NOT NULL,
    client_admin_password VARCHAR(255) NOT NULL,
    remarks TEXT,
    
    -- Soft Delete & Status
    is_active BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMP NULL,
    
    -- Audit Columns (Links to Super Admin Users)
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL, 
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL,

    FOREIGN KEY (account_manager_id) REFERENCES super_admin_users(id) ON DELETE SET NULL,
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

-- Chart of Accounts
CREATE TABLE chart_of_accounts (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    parent_id INT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    
    -- Audit Columns
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES client_users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES client_users(id) ON DELETE SET NULL,
    UNIQUE(client_id, name)
);

-- Currencies
CREATE TABLE client_currencies (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    is_base BOOLEAN DEFAULT FALSE,
    decimal_places INT DEFAULT 2,
    format VARCHAR(50),
    
    -- Audit Columns
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES client_users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES client_users(id) ON DELETE SET NULL,
    UNIQUE(client_id, code)
);

-- Vendors
CREATE TABLE purchase_vendors (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- Business/Individual
    primary_contact VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    
    -- Additional info
    tax_treatment VARCHAR(100),
    currency_id INT,
    opening_balance DECIMAL(18,3) DEFAULT 0.000,
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
    status VARCHAR(50) DEFAULT 'Active',
    is_active BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMP NULL,
    
    -- Audit Columns
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (currency_id) REFERENCES client_currencies(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES client_users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES client_users(id) ON DELETE SET NULL
);

-- Vendor Contacts
CREATE TABLE purchase_vendor_contacts (
    id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL,
    salutation VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    designation VARCHAR(150),
    
    -- Audit Columns
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL,
    
    FOREIGN KEY (vendor_id) REFERENCES purchase_vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES client_users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES client_users(id) ON DELETE SET NULL
);

-- Inventory Categories
CREATE TABLE inventory_categories (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    
    -- Audit Columns
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES client_users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES client_users(id) ON DELETE SET NULL,
    UNIQUE(client_id, name)
);

-- Inventory Sub-Categories
CREATE TABLE inventory_sub_categories (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    
    -- Audit Columns
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES inventory_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES client_users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES client_users(id) ON DELETE SET NULL,
    UNIQUE(client_id, category_id, name)
);

-- Unit of Measures
CREATE TABLE inventory_unit_of_measures (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    
    -- Audit Columns
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES client_users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES client_users(id) ON DELETE SET NULL,
    UNIQUE(client_id, name)
);

-- VAT Settings
CREATE TABLE vat_settings (
    client_id INT PRIMARY KEY,
    is_vat_registered BOOLEAN DEFAULT FALSE,
    tax_registration_number VARCHAR(100) NULL,
    vat_registered_on DATE NULL,
    
    -- Audit Columns
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES client_users(id) ON DELETE SET NULL
);

-- VAT Rates
CREATE TABLE vat_rates (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    rate DECIMAL(5,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    
    -- Audit Columns
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES client_users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES client_users(id) ON DELETE SET NULL,
    UNIQUE(client_id, name)
);

-- Inventory Items
CREATE TABLE inventory_items (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL,
    item_code VARCHAR(50) NOT NULL, -- e.g., ITM-001
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    description TEXT,
    
    -- Categorization & Units
    uom_id INT NOT NULL,
    category_id INT NOT NULL,
    sub_category_id INT NULL,
    
    -- Sales Information
    sales_rate DECIMAL(18,3),
    vat_preference VARCHAR(50), -- taxable, non-taxable, exempt
    sales_account_id INT,
    sales_description TEXT,
    
    -- Purchase Information
    purchase_cost DECIMAL(18,3),
    reorder_point INT DEFAULT 0,
    purchase_account_id INT,
    purchase_description TEXT,
    
    -- Inventory Tracking
    inventory_account_id INT,
    stock_in_hand DECIMAL(18,3) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Active',
    
    -- Physical Details
    warranty_period VARCHAR(100),
    shelf_life VARCHAR(100),
    vendor_id INT,
    weight_per_unit DECIMAL(18,3),
    weight_uom_id INT,
    valuation_method VARCHAR(50), -- fifo, lifo, average
    volume_per_unit DECIMAL(18,3),
    volume_uom_id INT,
    inventory_description TEXT,
    
    -- Audit Columns
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (uom_id) REFERENCES inventory_unit_of_measures(id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES inventory_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (sub_category_id) REFERENCES inventory_sub_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (sales_account_id) REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (purchase_account_id) REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (inventory_account_id) REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (vendor_id) REFERENCES purchase_vendors(id) ON DELETE SET NULL,
    FOREIGN KEY (weight_uom_id) REFERENCES inventory_unit_of_measures(id) ON DELETE SET NULL,
    FOREIGN KEY (volume_uom_id) REFERENCES inventory_unit_of_measures(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES client_users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES client_users(id) ON DELETE SET NULL,
    
    UNIQUE(client_id, item_code),
    UNIQUE(client_id, sku)
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
    currency_id INT,
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
    FOREIGN KEY (currency_id) REFERENCES client_currencies(id) ON DELETE SET NULL,
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

-- Sales Persons
CREATE TABLE sales_persons (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    
    -- Audit Columns
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES client_users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES client_users(id) ON DELETE SET NULL,
    UNIQUE(client_id, name)
);

-- Sales Partners
CREATE TABLE sales_partners (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    commission DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    
    -- Audit Columns
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES client_users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES client_users(id) ON DELETE SET NULL,
    UNIQUE(client_id, name)
);

CREATE TABLE company_profiles (
    client_id INT PRIMARY KEY,
    
    company_name VARCHAR(255),
    cr_number VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    fiscal_year VARCHAR(100),
    fiscal_start_date VARCHAR(10),
    fiscal_period VARCHAR(100),
    
    -- Branding
    logo_path VARCHAR(512),
    
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
    
    -- Localization
    default_language VARCHAR(50) DEFAULT 'English',
    time_zone VARCHAR(100) DEFAULT 'UTC + 3:00',
    date_format VARCHAR(100),
    currency_format VARCHAR(50),
    
    -- Audit Columns
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT NULL,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
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
    client_admin_username, client_admin_password, account_manager_id, created_by
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

-- 6. Initial Chart of Accounts for Test Corp
INSERT INTO chart_of_accounts (client_id, name, type, status) VALUES 
(1, 'Sales', 'Income', 'Active'),
(1, 'Cost of Goods Sold', 'Cost of Goods Sold', 'Active'),
(1, 'Inventory Asset', 'Stock', 'Active');

-- 7. Supplemental Chart of Accounts
INSERT INTO chart_of_accounts (client_id, name, type, status) VALUES 
(1, 'Main Operating Account', 'Bank', 'Active'),
(1, 'Utilities Expense', 'Expense', 'Active'),
(1, 'VAT Payable', 'Other Current Liability', 'Active');

-- Child Accounts for Utilities Expense (Parent ID: 5)
INSERT INTO chart_of_accounts (client_id, name, type, parent_id, status) VALUES 
(1, 'Electricity Expense', 'Expense', 5, 'Active'),
(1, 'Water Expense', 'Expense', 5, 'Active');

-- 8. Currencies
INSERT INTO client_currencies (client_id, name, code, symbol, is_base, decimal_places) VALUES 
(1, 'Bahraini Dinar', 'BHD', 'BHD', TRUE, 3),
(1, 'UAE Dirham', 'AED', 'AED', FALSE, 2),
(1, 'Canadian Dollar', 'CAD', '$', FALSE, 2),
(1, 'Euro', 'EUR', '€', FALSE, 2),
(1, 'Pound Sterling', 'GBP', '£', FALSE, 2),
(1, 'Pakistani Rupee', 'PKR', 'Rs.', FALSE, 0),
(1, 'Kuwaiti Dinar', 'KWD', 'KWD', FALSE, 3),
(1, 'Qatari Riyal', 'QAR', 'QAR', FALSE, 2),
(1, 'Saudi Riyal', 'SAR', 'SAR', FALSE, 2),
(1, 'United States Dollar', 'USD', '$', FALSE, 2);

-- 9. Business Entities (Vendors & Customers)
INSERT INTO purchase_vendors (client_id, name, type, email, phone, currency_id, status) VALUES 
(1, 'Gulf HVAC Supplies', 'Business', 'sales@gulfhvac.com', '+973 17111111', 1, 'Active'),
(1, 'CoolingTech Parts', 'Business', 'orders@coolingtech.com', '+973 17222222', 1, 'Active'),
(1, 'Global Electronics', 'Business', 'info@globalelec.com', '+1 555-0199', 10, 'Active'),
(1, 'Industrial Pumps Ltd', 'Business', 'support@indpumps.co.uk', '+44 20 7946 0958', 5, 'Active'),
(1, 'Express Logistics', 'Business', 'dispatch@expresslog.com', '+973 17333333', 1, 'Active');

INSERT INTO purchase_vendor_contacts (vendor_id, first_name, last_name, email, phone, designation) VALUES 
(1, 'Ali', 'Al-Mansoori', 'ali@gulfhvac.com', '+973 33111111', 'Sales Manager'),
(1, 'Ahmed', 'Hassan', 'ahmed@gulfhvac.com', '+973 33111122', 'Technical Lead'),
(2, 'Sarah', 'Ahmed', 'sarah@coolingtech.com', '+973 33222222', 'Accountant'),
(3, 'John', 'Doe', 'j.doe@globalelec.com', '+1 555-0200', 'Regional Manager'),
(3, 'Jane', 'Smith', 'j.smith@globalelec.com', '+1 555-0201', 'Procurement'),
(4, 'Robert', 'Brown', 'r.brown@indpumps.co.uk', '+44 20 7946 0960', 'Service Manager'),
(5, 'Mohammed', 'Isa', 'm.isa@expresslog.com', '+973 33444444', 'Fleet Supervisor');

INSERT INTO customers (client_id, name, type, email, phone, currency_id, is_active) VALUES 
(1, 'Royal Tower Management', 'Business', 'info@royaltower.bh', '+973 17333333', 1, TRUE);

INSERT INTO customer_contacts (customer_id, first_name, last_name, email, phone, designation) VALUES 
(1, 'Hassan', 'Yusuf', 'h.yusuf@royaltower.bh', '+973 33555555', 'Facility Manager');

-- 10. Inventory Foundations (UOM & Categories)
INSERT INTO inventory_unit_of_measures (client_id, name, status) VALUES 
(1, 'Pieces', 'Active'),
(1, 'Kilograms', 'Active'),
(1, 'Meters', 'Active');

INSERT INTO inventory_categories (client_id, name, status) VALUES 
(1, 'AC Units', 'Active'),
(1, 'Consumables', 'Active');

INSERT INTO inventory_sub_categories (client_id, category_id, name, status) VALUES 
(1, 2, 'Refrigerant Gas', 'Active');

(1, 2, 'Refrigerant Gas', 'Active');

-- 11. VAT Configuration
INSERT INTO vat_settings (client_id, is_vat_registered, tax_registration_number, vat_registered_on) 
VALUES (1, TRUE, '100234567800003', '2019-01-01');

INSERT INTO vat_rates (client_id, name, rate, status) VALUES 
(1, 'Standard Rate', 5.00, 'Active'),
(1, 'Zero Rated', 0.00, 'Active');

(1, 'Zero Rated', 0.00, 'Active');

-- 12. Relational Inventory Items
INSERT INTO inventory_items (
    client_id, item_code, name, sku, uom_id, category_id, sub_category_id, 
    sales_rate, purchase_cost, sales_account_id, purchase_account_id, inventory_account_id, 
    vendor_id, stock_in_hand, status
) VALUES 
(1, 'ITM-001', 'Split AC Unit 1.5 Ton', 'SAC-15-GULF', 1, 1, NULL, 250.000, 180.000, 1, 2, 3, 1, 25.000, 'Active'),
(1, 'ITM-002', 'R410A Refrigerant', 'REF-410A-KG', 2, 2, 1, 15.500, 8.200, 1, 2, 3, 2, 120.000, 'Active');

(1, 'ITM-002', 'R410A Refrigerant', 'REF-410A-KG', 2, 2, 1, 15.500, 8.200, 1, 2, 3, 2, 120.000, 'Active');

-- 13. Sales Persons
INSERT INTO sales_persons (client_id, name, description, status) VALUES 
(1, 'Aaliyah Khan', '-', 'Active'),
(1, 'Liam Schmidt', 'Outsourced Person', 'Active'),
(1, 'Zara Al-Farsi', '-', 'Active'),
(1, 'Omar Dubois', '-', 'Inactive');

(1, 'Omar Dubois', '-', 'Inactive');

-- 14. Sales Partners
INSERT INTO sales_partners (client_id, name, commission, description, status) VALUES 
(1, 'Jack Thomas', 10.00, '-', 'Active'),
(1, 'Stellar Marketing', 5.00, 'Collaborating to enhance our offerings.', 'Active'),
(1, 'Eco Innovations', 20.00, '-', 'Active'),
(1, 'Noah Patel', 10.00, 'Working together for mutual success.', 'Inactive');

INSERT INTO company_profiles (
    client_id, company_name, cr_number, email, phone, mobile,
    fiscal_year, fiscal_start_date, fiscal_period,
    billing_country, shipment_country,
    default_language, time_zone, date_format, currency_format
) VALUES (
    1, 'Optima', '2381271-1', 'info@optima.com', '1712 3456', '3456 7890',
    'January - December', '01', '01 January - 31 December',
    'Bahrain', 'Bahrain',
    'English', 'UTC + 3:00', 'dd MMM yyyy - 26 Jan 2026', '0.000'
);

