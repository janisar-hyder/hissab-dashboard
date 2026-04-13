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




| Error Code | Meaning | Likely Cause |
| :--- | :--- | :--- |
| **400 Bad Request** | Invalid Input | Missing required field (e.g., `name`) or DB constraint (e.g., Category linked to an Item). |
| **404 Not Found** | Missing Record | The ID provided does not exist in the database for your Client. |
| **500 Internal Error**| Server Crash | Check the terminal for error logs. |

---
*Last Updated: 2026-04-12*
