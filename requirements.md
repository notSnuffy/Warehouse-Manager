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

---

# Use Cases

## View the inventory list

- **Starting situation (Initial assumption)**

  - The user is logged into the system and has permission to view the inventory.

- **Normal**

  1. The user navigates to the inventory section by clicking the designated button, menu item, or entering the inventory url.
  2. The system displays the entire list of inventory items in a default order (e.g., alphabetical or by category).

- **What can go wrong**

  - The system fails to load the inventory due to a server or network error. An error message is shown.

- **System state on completion**
  - The user sees the current inventory list, or an appropriate message if the list cannot be loaded.

### Diagram

![View inventory list diagram](diagrams/view-inventory-list.svg)

## Track the location of a specific item

- **Starting situation (Initial assumption)**

  - The user is logged into the system and has permission to view the inventory.

- **Preconditions**

  - The item exists in the inventory.

- **Normal**

  1. The user navigates to the inventory section.
  2. The user searches for a specific item using the search bar, using filters, or by scrolling through the list.
  3. The user clicks the track location button
  4. The system retrieves the item's location.
  5. The system renders an interactable screen showing the item's location on a specific floor by highlighting the furniture where the item resides.

- **What can go wrong**

  - The system fails to retrieve the location. An error message is shown.

- **System state on completion**
  - The user sees the screen with the item's location, or an appropriate message if the item location cannot be retrieved.

### Diagram

![Track item location diagram](diagrams/track-item-location.svg)

## Add, edit, or remove a shape

- **Starting situation (Initial assumption)**

  - The user is logged into the system and has permission to manage shapes.

- **Preconditions**

  - The user has navigated to the shapes management section.

- **Add**

  1. The user clicks the button to add a new shape.
  2. The system shows an editor with a list of other shapes as a base to create a new shape.
  3. The user uses the editor to create a new shape by selecting other shapes and modifying them.
  4. The user clicks the save button.
  5. The user inputs additional data for the new shape (e.g., name, description).
  6. The user clicks the confirm button.
  7. The system validates the input data.
  8. The system saves the new shape.

- **Edit**

  1. The user finds the existing shape from the list he wants to edit.
  2. The user clicks the edit button.
  3. The system shows the editor with the selected shape.
  4. The user modifies the shapes needed.
  5. The user clicks the save button.
  6. The user can edit additional data for the shape (e.g., name, description).
  7. The user clicks the confirm button.
  8. The system validates the input data.
  9. The system saves the changes to the shape.

- **Remove**

  1. The user finds the existing shape from the list he wants to remove.
  2. The user clicks the remove button.
  3. The system prompts the user to confirm the removal.
  4. The user confirms the removal.
  5. The system removes the shape.

- **What can go wrong**

  - The user enters invalid data (e.g., missing required fields, incorrect format). An error message is shown.
  - The system fails to save the shape due to a server or network error. An error message is shown.

- **System state on completion**
  - The new or edited shape is saved and displayed in the shapes list, deleted shape is removed from the list, or an appropriate error message is shown if the action fails.

### Diagram

#### Add a new shape

![Add a shape diagram](diagrams/add-shape.svg)

#### Edit an existing shape

![Edit a shape diagram](diagrams/edit-shape.svg)

#### Remove an existing shape

![Remove a shape diagram](diagrams/remove-shape.svg)
