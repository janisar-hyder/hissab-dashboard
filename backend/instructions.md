## ⚙️ Prerequisites
1.  **Server Status**: Ensure your backend is running (`npm run dev` in the `/backend` folder).
2.  **Base URL**: `http://localhost:3000`
3.  **Database Automation (Prisma)**:
    - If you are setting up for the first time, run: `npx prisma migrate dev`
    - This will build all your tables automatically.
    - To seed base test data, run: `node prisma/seed.js`

---

## 📦 1. Inventory Module

### A. List Categories
Fetch all active inventory categories for the current tenant.
*   **Method**: `GET`
*   **URL**: `{{base_url}}/api/v1/inventory/categories`
*   **Response**: `200 OK`

### B. Create Category
Add a new category to the inventory system.
*   **Method**: `POST`
*   **URL**: `{{base_url}}/api/v1/inventory/categories`
*   **Headers**: `Content-Type: application/json`
*   **Body (JSON)**:
    ```json
    {
      "name": "Installation Tools",
      "description": "Equipment used for on-site HVAC setup",
      "status": "Active"
    }
    ```

### C. Update Category (Partial)
Update specific fields of an existing category.
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/inventory/categories/:id` (Replace `:id` with a real ID, e.g., `1`)
*   **Body (JSON)**:
    ```json
    {
      "name": "Luxury AC Units"
    }
    ```

### D. Bulk Delete Categories
Delete multiple categories in a single request.
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/inventory/categories`
*   **Body (JSON)**:
    ```json
    {
      "ids": [2, 3]
    }
    ```

### E. Single Delete
Delete a specific category by its ID.
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/inventory/categories/:id`

### F. Bulk Status Update
Update the status of multiple categories at once.
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/inventory/categories/bulk-status`
*   **Body (JSON)**:
    ```json
    {
      "ids": [1, 2],
      "status": "Inactive"
    }
    ```

---

### G. List Items
Fetch all inventory items.
*   **Method**: `GET`
*   **URL**: `{{base_url}}/api/v1/inventory/items`

### H. Create Item
*   **Method**: `POST`
*   **URL**: `{{base_url}}/api/v1/inventory/items`
*   **Headers**: `Content-Type: application/json`
*   **Body (JSON)**:
    ```json
    {
      "item_code": "ITM-001",
      "name": "Split AC 1.5 Ton",
      "uom_id": 1,
      "category_id": 1,
      "sales_rate": 250.00,
      "purchase_cost": 200.00,
      "status": "Active"
    }
    ```

### I. Update Item
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/inventory/items/:id`
*   **Body (JSON)**:
    ```json
    {
      "sales_rate": 260.00
    }
    ```

### J. Bulk Delete Items
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/inventory/items`
*   **Body (JSON)**:
    ```json
    {
      "ids": [1, 2]
    }
    ```

### K. Single Delete Item
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/inventory/items/:id`

### L. Bulk Status Update Items
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/inventory/items/bulk-status`
*   **Body (JSON)**:
    ```json
    {
      "ids": [1, 2],
      "status": "Inactive"
    }
    ```

---

## 📂 2. Sub-Category Module
Managed sub-categories linked to parent categories.

### A. List Sub-Categories
Fetch all sub-categories including their parent category names.
*   **Method**: `GET`
*   **URL**: `{{base_url}}/api/v1/inventory/sub-categories`

### B. Create Sub-Category
*   **Method**: `POST`
*   **URL**: `{{base_url}}/api/v1/inventory/sub-categories`
*   **Body (JSON)**:
    ```json
    {
      "name": "Split units",
      "category_id": 1,
      "description": "Wall-mounted split ACs"
    }
    ```

### C. Update Sub-Category
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/inventory/sub-categories/:id`
*   **Body (JSON)**:
    ```json
    {
      "name": "Luxury Split Units"
    }
    ```

### D. Bulk Delete Sub-Categories
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/inventory/sub-categories`
*   **Body (JSON)**:
    ```json
    {
      "ids": [1]
    }
    ```

### E. Single Delete
Delete a specific sub-category by its ID.
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/inventory/sub-categories/:id`

### F. Bulk Status Update
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/inventory/sub-categories/bulk-status`
*   **Body (JSON)**:
    ```json
    {
      "ids": [1],
      "status": "Active"
    }
    ```

---

## 📏 3. Unit of Measures
Manage billing and inventory units (e.g., Kg, Pcs).

### A. List Units
*   **Method**: `GET`
*   **URL**: `{{base_url}}/api/v1/inventory/units`

### B. Create Unit
*   **Method**: `POST`
*   **URL**: `{{base_url}}/api/v1/inventory/units`
*   **Body (JSON)**:
    ```json
    {
      "name": "Meters",
      "status": "Active"
    }
    ```

### C. Update Unit
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/inventory/units/:id`
*   **Body (JSON)**:
    ```json
    {
      "name": "Updated Unit Name"
    }
    ```

### D. Bulk Delete Units
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/inventory/units`
*   **Body (JSON)**:
    ```json
    {
      "ids": [1]
    }
    ```

### E. Single Delete
Delete a specific unit by its ID.
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/inventory/units/:id`

### F. Bulk Status Update
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/inventory/units/bulk-status`
*   **Body (JSON)**:
    ```json
    {
      "ids": [1],
      "status": "Inactive"
    }
    ```




---

## ⚖️ 4. VAT & Compliance Module

### A. List VAT Rates
Fetch all VAT rates for the current tenant.
*   **Method**: `GET`
*   **URL**: `{{base_url}}/api/v1/vat-compliance/vat-rates`

### B. Create VAT Rate
*   **Method**: `POST`
*   **URL**: `{{base_url}}/api/v1/vat-compliance/vat-rates`
*   **Body (JSON)**:
    ```json
    {
      "name": "Standard Rate",
      "rate": 15.00,
      "status": "Active"
    }
    ```

### C. Update VAT Rate
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/vat-compliance/vat-rates/:id`
*   **Body (JSON)**:
    ```json
    {
      "rate": 10.00
    }
    ```

### D. Bulk Delete VAT Rates
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/vat-compliance/vat-rates`
*   **Body (JSON)**:
    ```json
    {
      "ids": [1, 2]
    }
    ```

### E. Single Delete
Delete a specific VAT rate by its ID.
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/vat-compliance/vat-rates/:id`

### F. Bulk Status Update
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/vat-compliance/vat-rates/bulk-status`
*   **Body (JSON)**:
    ```json
    {
      "ids": [1],
      "status": "Inactive"
    }
    ```

### G. List VAT Settings
Fetch the global VAT configuration for the current tenant.
*   **Method**: `GET`
*   **URL**: `{{base_url}}/api/v1/vat-compliance/settings`

### H. Update VAT Settings
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/vat-compliance/settings`
*   **Body (JSON)**:
    ```json
    {
      "is_vat_registered": true,
      "tax_registration_number": "100234567800003",
      "vat_registered_on": "2019-01-01"
    }
    ```

---

## 🏢 5. Organization Module

### A. List Sales Partners
Fetch all sales partners for the current tenant.
*   **Method**: `GET`
*   **URL**: `{{base_url}}/api/v1/organization/sales-partners`

### B. Create Sales Partner
*   **Method**: `POST`
*   **URL**: `{{base_url}}/api/v1/organization/sales-partners`
*   **Body (JSON)**:
    ```json
    {
      "name": "Jack Thomas",
      "commission": 15.00,
      "description": "Premium partner",
      "status": "Active"
    }
    ```

### C. Update Sales Partner
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/organization/sales-partners/:id`
*   **Body (JSON)**:
    ```json
    {
      "commission": 12.00
    }
    ```

### D. Bulk Delete Sales Partners
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/organization/sales-partners`
*   **Body (JSON)**:
    ```json
    {
      "ids": [1, 2]
    }
    ```

### E. Single Delete
Delete a specific sales partner by its ID.
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/organization/sales-partners/:id`

### F. Bulk Status Update
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/organization/sales-partners/bulk-status`
*   **Body (JSON)**:
    ```json
    {
      "ids": [1, 2],
      "status": "Inactive"
    }
    ```

---

### G. List Sales Persons
Fetch all sales persons for the current tenant.
*   **Method**: `GET`
*   **URL**: `{{base_url}}/api/v1/organization/sales-persons`

### H. Create Sales Person
*   **Method**: `POST`
*   **URL**: `{{base_url}}/api/v1/organization/sales-persons`
*   **Body (JSON)**:
    ```json
    {
      "name": "Sarah Miller",
      "description": "Junior sales agent",
      "status": "Active"
    }
    ```

### I. Update Sales Person
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/organization/sales-persons/:id`
*   **Body (JSON)**:
    ```json
    {
      "name": "Sarah Miller Updated"
    }
    ```

### J. Bulk Delete Sales Persons
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/organization/sales-persons`
*   **Body (JSON)**:
    ```json
    {
      "ids": [1, 2]
    }
    ```

### K. Single Delete
Delete a specific sales person by its ID.
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/organization/sales-persons/:id`

### L. Bulk Status Update
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/organization/sales-persons/bulk-status`
*   **Body (JSON)**:
    ```json
    {
      "ids": [1],
      "status": "Inactive"
    }
    ```

---

### M. List Currencies
Fetch all currencies for the current tenant.
*   **Method**: `GET`
*   **URL**: `{{base_url}}/api/v1/organization/currencies`

### N. Create Currency
*   **Method**: `POST`
*   **URL**: `{{base_url}}/api/v1/organization/currencies`
*   **Body (JSON)**:
    ```json
    {
      "name": "US Dollar",
      "code": "USD",
      "symbol": "$",
      "is_base": true,
      "decimal_places": 2,
      "format": "en-US"
    }
    ```

### O. Update Currency
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/organization/currencies/:id`
*   **Body (JSON)**:
    ```json
    {
      "decimal_places": 3
    }
    ```

### P. Bulk Delete Currencies
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/organization/currencies`
*   **Body (JSON)**:
    ```json
    {
      "ids": [1, 2]
    }
    ```

---

### Q. Get Company Profile
Fetch the company's profile details.
*   **Method**: `GET`
*   **URL**: `{{base_url}}/api/v1/organization/profile`

### R. Update Company Profile
Update or initialize the company profile.
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/organization/profile`
*   **Body (JSON)**:
    ```json
    {
      "company_name": "Hissab Solutions",
      "cr_number": "CR-123456789",
      "email": "info@hissab.app",
      "fiscal_year": "2024",
      "time_zone": "UTC + 3:00",
      "billing_address": "Main Street, Tech District",
      "billing_city": "Dubai"
    }
    ```

---

## 5. Accounts Module
All routes are prefixed with `{{base_url}}/api/v1/accounts`

### A. List Accounts
Fetch the full Chart of Accounts.
*   **Method**: `GET`
*   **URL**: `{{base_url}}/api/v1/accounts/chart-of-accounts`

### B. Create Account
*   **Method**: `POST`
*   **URL**: `{{base_url}}/api/v1/accounts/chart-of-accounts`
*   **Body (JSON)**:
    ```json
    {
      "name": "Sales Income",
      "type": "Income",
      "description": "General sales revenue"
    }
    ```

### C. Create Sub-Account (with Parent ID)
*   **Method**: `POST`
*   **URL**: `{{base_url}}/api/v1/accounts/chart-of-accounts`
*   **Body (JSON)**:
    ```json
    {
      "name": "Local Sales",
      "type": "Income",
      "parent_id": 1,
      "description": "Revenue from local customers"
    }
    ```

### D. Update Account
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/accounts/chart-of-accounts/:id`
*   **Body (JSON)**:
    ```json
    {
      "name": "General Sales Income"
    }
    ```

### E. Bulk Status Update
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/accounts/chart-of-accounts/bulk-status`
*   **Body (JSON)**:
    ```json
    {
      "ids": [1, 2],
      "status": "Inactive"
    }
    ```

### F. Delete Single Account
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/accounts/chart-of-accounts/:id`

### G. Bulk Delete Accounts
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/accounts/chart-of-accounts`
*   **Body (JSON)**:
    ```json
    {
      "ids": [1, 2]
    }
    ```

---

## 🛍️ 6. Purchases Module

### A. List Vendors
Fetch all vendors.
*   **Method**: `GET`
*   **URL**: `{{base_url}}/api/v1/purchases/vendors`

### B. Create Vendor
*   **Method**: `POST`
*   **URL**: `{{base_url}}/api/v1/purchases/vendors`
*   **Headers**: `Content-Type: application/json`
*   **Body (JSON)**:
    ```json
    {
      "name": "Supplier Inc.",
      "email": "supplier@example.com",
      "phone": "+1234567890",
      "currency_id": 1,
      "status": "Active"
    }
    ```

### C. Get Vendor by ID
*   **Method**: `GET`
*   **URL**: `{{base_url}}/api/v1/purchases/vendors/:id`

### D. Update Vendor
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/purchases/vendors/:id`
*   **Body (JSON)**:
    ```json
    {
      "email": "new.email@example.com"
    }
    ```

### E. Bulk Status Update
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/purchases/vendors/bulk-status`
*   **Body (JSON)**:
    ```json
    {
      "ids": [1, 2],
      "status": "Inactive"
    }
    ```

### F. Delete Single Vendor
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/purchases/vendors/:id`

### G. Bulk Delete Vendors
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/purchases/vendors`
*   **Body (JSON)**:
    ```json
    {
      "ids": [1, 2]
    }
    ```

---

## 📇 7. Contacts Module

### A. List Vendor Contacts
Fetch vendor contacts. Can be filtered by vendor ID.
*   **Method**: `GET`
*   **URL**: `{{base_url}}/api/v1/contacts/vendor-contacts?vendorId=1`

### B. Create Vendor Contact
*   **Method**: `POST`
*   **URL**: `{{base_url}}/api/v1/contacts/vendor-contacts`
*   **Headers**: `Content-Type: application/json`
*   **Body (JSON)**:
    ```json
    {
      "vendor_id": 1,
      "salutation": "Mr.",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "mobile": "+0987654321",
      "designation": "Manager"
    }
    ```

### C. Update Vendor Contact
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/contacts/vendor-contacts/:id`
*   **Body (JSON)**:
    ```json
    {
      "designation": "Senior Manager"
    }
    ```

### D. Delete Single Vendor Contact
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/contacts/vendor-contacts/:id`

### E. Bulk Delete Vendor Contacts
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/contacts/vendor-contacts`
*   **Body (JSON)**:
    ```json
    {
      "ids": [1, 2]
    }
    ```

---

## 📈 8. Sales Module

### A. List Customers
Fetch all customers.
*   **Method**: `GET`
*   **URL**: `{{base_url}}/api/v1/sales/customers`

### B. Create Customer
*   **Method**: `POST`
*   **URL**: `{{base_url}}/api/v1/sales/customers`
*   **Headers**: `Content-Type: application/json`
*   **Body (JSON)**:
    ```json
    {
      "name": "Acme Corp",
      "email": "contact@acme.com",
      "phone": "+1987654321",
      "currency_id": 1,
      "is_active": true
    }
    ```

### C. Get Customer by ID
*   **Method**: `GET`
*   **URL**: `{{base_url}}/api/v1/sales/customers/:id`

### D. Update Customer
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/sales/customers/:id`
*   **Body (JSON)**:
    ```json
    {
      "email": "new.contact@acme.com"
    }
    ```

### E. Bulk Status Update
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/sales/customers/bulk-status`
*   **Body (JSON)**:
    ```json
    {
      "ids": [1, 2],
      "is_active": false
    }
    ```

### F. Delete Single Customer
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/sales/customers/:id`

### G. Bulk Delete Customers
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/sales/customers`
*   **Body (JSON)**:
    ```json
    {
      "ids": [1, 2]
    }
    ```

---

## 📇 9. Contacts Module

### A. List Vendor Contacts
Fetch vendor contacts. Can be filtered by vendor ID.
*   **Method**: `GET`
*   **URL**: `{{base_url}}/api/v1/contacts/vendor-contacts?vendorId=1`

### B. Create Vendor Contact
*   **Method**: `POST`
*   **URL**: `{{base_url}}/api/v1/contacts/vendor-contacts`
*   **Headers**: `Content-Type: application/json`
*   **Body (JSON)**:
    ```json
    {
      "vendor_id": 1,
      "salutation": "Mr.",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "mobile": "+0987654321",
      "designation": "Manager"
    }
    ```

### C. Update Vendor Contact
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/contacts/vendor-contacts/:id`
*   **Body (JSON)**:
    ```json
    {
      "designation": "Senior Manager"
    }
    ```

### D. Delete Single Vendor Contact
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/contacts/vendor-contacts/:id`

### E. Bulk Delete Vendor Contacts
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/contacts/vendor-contacts`
*   **Body (JSON)**:
    ```json
    {
      "ids": [1, 2]
    }
    ```

### F. List Customer Contacts
Fetch customer contacts. Can be filtered by customer ID.
*   **Method**: `GET`
*   **URL**: `{{base_url}}/api/v1/contacts/customer-contacts?customerId=1`

### G. Create Customer Contact
*   **Method**: `POST`
*   **URL**: `{{base_url}}/api/v1/contacts/customer-contacts`
*   **Headers**: `Content-Type: application/json`
*   **Body (JSON)**:
    ```json
    {
      "customer_id": 1,
      "salutation": "Ms.",
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane.smith@acme.com",
      "phone": "+1987654321",
      "designation": "Director"
    }
    ```

### H. Update Customer Contact
*   **Method**: `PATCH`
*   **URL**: `{{base_url}}/api/v1/contacts/customer-contacts/:id`
*   **Body (JSON)**:
    ```json
    {
      "designation": "VP"
    }
    ```

### I. Delete Single Customer Contact
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/contacts/customer-contacts/:id`

### J. Bulk Delete Customer Contacts
*   **Method**: `DELETE`
*   **URL**: `{{base_url}}/api/v1/contacts/customer-contacts`
*   **Body (JSON)**:
    ```json
    {
      "ids": [1, 2]
    }
    ```

---

## 🛠️ Error Reference

| Error Code | Meaning | Likely Cause |
| :--- | :--- | :--- |
| **400 Bad Request** | Invalid Input | Missing required field (e.g., `name`) or DB constraint (e.g., Category linked to an Item). |
| **404 Not Found** | Missing Record | The ID provided does not exist in the database for your Client. |
| **500 Internal Error**| Server Crash | Check the terminal for error logs. |

---
*Last Updated: 2026-04-15*
