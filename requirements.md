# User Roles

| Role Name         | Description                          | Permissions/Responsibilities                                                                                                                                                                                       |
| ----------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Administrator     | Has full control over the system     | Can manage users, inventory, shapes, furniture, floors, and permissions. Can add/edit/remove any user and assign roles. Can modify inventory and perform all operations.                                           |
| Warehouse Worker  | Handles inventory operations         | Update stock, view inventory, track locations. Cannot modify shapes, furniture and floors                                                                                                                          |
| Observer          | Views inventory                      | Browses products. Cannot do any modifications                                                                                                                                                                      |
| Warehouse Manager | Oversees warehouse operations        | Manages Warehouse Workers assigned to him, Can do inventory operations. Cannot modify users not assigned. Cannot modify shapes, furniture and floors.                                                              |
| Furniture Editor  | Creates furniture and shapes         | Can add/edit/remove furniture and shapes. Cannot modify users, inventory, floors and cannot do inventory operations.                                                                                               |
| Floor Editor      | Creates floors                       | Can add/edit/remove floors. Cannot modify users, inventory, shapes and furniture. Cannot do inventory operations.                                                                                                  |
| Editor Manager    | Manages furniture and floors editors | Can add/edit/remove shapes, furniture and floors. Can manage users assigned to him. Cannot do inventory operations. Cannot modify users not assigned to him. Cannot modify inventory. Can assign the editor roles. |

---

# Functional Requirements

| ID    | Requirement Description                                           | Related User Roles                                            |
| ----- | ----------------------------------------------------------------- | ------------------------------------------------------------- |
| FR-1  | Users can log in to the system                                    | All                                                           |
| FR-2  | Users can add, edit, or remove users                              | Administrator, Warehouse Manager, Editor Manager              |
| FR-3  | Users can create new roles with custom permissions                | Administrator                                                 |
| FR-4  | Users can assign roles to other users                             | Administrator, Editor Manager                                 |
| FR-5  | Users can manage permissions for roles                            | Administrator                                                 |
| FR-6  | Users can view and manage assigned roles                          | Administrator, Warehouse Manager, Editor Manager              |
| FR-7  | Users can view list of users                                      | Administrator, Warehouse Manager, Editor Manager              |
| FR-8  | Users can search for specific users and filter them               | Administrator, Warehouse Manager, Editor Manager              |
| FR-9  | Users can add, edit, or remove products in inventory              | Administrator, Warehouse Worker, Warehouse Manager            |
| FR-10 | Users can view inventory list                                     | Administrator, Warehouse Worker, Warehouse Manager, Observer  |
| FR-11 | Users can filter and search inventory items                       | Administrator, Warehouse Worker, Warehouse Manager, Observer  |
| FR-12 | Users can track location of specific items                        | Administrator, Warehouse Worker, Warehouse Manager, Observer  |
| FR-13 | Users can view detailed information about items                   | Administrator, Warehouse Worker, Warehouse Manager, Observer  |
| FR-14 | Users can generate reports on inventory                           | Administrator, Warehouse Manager                              |
| FR-15 | Users can look through logs of actions taken                      | Administrator, Warehouse Manager, Editor Manager              |
| FR-16 | Users can add, edit, or remove shapes                             | Administrator, Furniture Editor, Editor Manager               |
| FR-17 | Users can add, edit, or remove furniture                          | Administrator, Furniture Editor, Editor Manager               |
| FR-18 | Users can add, edit, or remove floors                             | Administrator, Floor Editor, Editor Manager                   |
| FR-19 | Users can view list of shapes and furniture                       | Administrator, Furniture Editor, Editor Manager               |
| FR-20 | Users can view list of floors                                     | Administrator, Floor Editor, Editor Manager                   |
| FR-21 | Users can search and filter shapes and furniture                  | Administrator, Furniture Editor, Editor Manager               |
| FR-22 | Users can search and filter floors                                | Administrator, Floor Editor, Editor Manager                   |
| FR-23 | Users can access a library of shared shapes and furniture         | Administrator, Furniture Editor, Editor Manager, Floor Editor |
| FR-24 | Users can move items between different furniture                  | Administrator, Warehouse Worker, Warehouse Manager            |
| FR-25 | It should be possible to create a first user with all permissions | None                                                          |

FR-20: Maybe Observer, Warehouse Worker, Warehouse Manager should be included since they should be able to look through the floors to add the items to specific locations

---

# Nonfunctional Requirements

| ID    | Requirement Description                                        |
| ----- | -------------------------------------------------------------- |
| NFR-1 | Sensitive information should be encrypted in transit           |
| NFR-2 | System should be responsive and fast                           |
| NFR-3 | Multiple users should be able to use the system simultaneously |
