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

## 🛠️ Error Reference

| Error Code | Meaning | Likely Cause |
| :--- | :--- | :--- |
| **400 Bad Request** | Invalid Input | Missing required field (e.g., `name`) or DB constraint (e.g., Category linked to an Item). |
| **404 Not Found** | Missing Record | The ID provided does not exist in the database for your Client. |
| **500 Internal Error**| Server Crash | Check the terminal for error logs. |

---
*Last Updated: 2026-04-15*
