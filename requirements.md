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

## Fr-10: View the inventory list

- **Relevant user roles**

  - Administrator
  - Warehouse Worker
  - Warehouse Manager
  - Observer

- **Starting situation (Initial assumption)**

  - Logged in user is either an Administrator, Warehouse Worker, Warehouse Manager, or Observer.

- **Normal**

  1. The user navigates to the inventory section by clicking the designated button, menu item, or entering the inventory url.
  2. The system displays the entire list of inventory items in a default order (e.g., alphabetical or by category).

- **What can go wrong**

  - The system fails to load the inventory due to a server or network error. An error message is shown.

- **System state on completion**
  - The user sees the current inventory list, or an appropriate message if the list cannot be loaded.

### Diagram

Shown from the perspective of the Warehouse Worker, but it is the same for all other relevant user roles.

![View inventory list diagram](diagrams/view-inventory-list.svg)

## FR-12: Track the location of a specific item

- **Relevant user roles**

  - Administrator
  - Warehouse Worker
  - Warehouse Manager
  - Observer

- **Starting situation (Initial assumption)**

  - Logged in user is either an Administrator, Warehouse Worker, Warehouse Manager, or Observer.

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

Shown from the perspective of the Warehouse Worker, but it is the same for all other relevant user roles.

![Track item location diagram](diagrams/track-item-location.svg)

## FR-16: Add, edit, or remove a shape

- **Relevant user roles**

  - Administrator
  - Furniture Editor
  - Editor Manager

- **Starting situation (Initial assumption)**

  - Logged in user is either an Administrator, Furniture Editor, or Editor Manager.

- **Preconditions**

  - The user has navigated to the shapes management section.

- **Add**

  1. The user clicks the button to add a new shape.
  2. The system shows an editor with a list of other shapes as a base to create a new shape.
  3. The user uses the editor to create a new shape by selecting other shapes and modifying them.
  4. The user clicks the save button.
  5. The system shows a form to input additional data for the new shape.
  6. The user inputs additional data for the new shape (e.g., name, description).
  7. The user clicks the confirm button.
  8. The system validates the input data.
  9. The system saves the new shape.

- **Edit**

  1. The user finds the existing shape from the list he wants to edit.
  2. The user clicks the edit button.
  3. The system shows the editor with the selected shape.
  4. The user modifies the shapes needed.
  5. The user clicks the save button.
  6. The system shows a form to input additional data for the shape.
  7. The user can edit additional data for the shape (e.g., name, description).
  8. The user clicks the confirm button.
  9. The system validates the input data.
  10. The system saves the changes to the shape.

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

Shown from the perspective of the Furniture Editor, but it is the same for all other relevant user roles.

#### Add a new shape

![Add a shape diagram](diagrams/add-shape.svg)

#### Edit an existing shape

![Edit a shape diagram](diagrams/edit-shape.svg)

#### Remove an existing shape

![Remove a shape diagram](diagrams/remove-shape.svg)

## FR-17: Add a furniture

- **Relevant user roles**

  - Administrator
  - Furniture Editor
  - Editor Manager

- **Starting situation (Initial assumption)**

  - Logged in user is either an Administrator, Furniture Editor, or Editor Manager.

- **Preconditions**

  - The user has navigated to the furniture management section.

- **Normal**

  1. The user clicks the button to add new furniture.
  2. The system shows an editor with a list of shapes to use to create new furniture.
  3. The user uses the editor to create the shape of the furniture using the shapes
  4. The user uses the editor to create "placeable" areas for the furniture by using the shapes
  5. The user clicks the save button.
  6. The systems prompts the user to choose a top-down view of the furniture.
  7. The user selects the top-down view of the furniture.
  8. The system shows a form to input additional data for the furniture.
  9. The user inputs additional data for the new furniture (e.g., name, description).
  10. The user clicks the confirm button.
  11. The system validates the input data.
  12. The system saves the new furniture.

- **What can go wrong**

  - The user enters invalid data (e.g., missing required fields, incorrect format). An error message is shown.
  - The system fails to save the furniture due to a server or network error. An error message is shown.

- **System state on completion**

  - The new furniture is saved and displayed in the furniture list, or an appropriate error message is shown if the action fails.

### Diagram

Shown from the perspective of the Furniture Editor, but it is the same for all other relevant user roles.

![Add a furniture diagram](diagrams/add-furniture.svg)

## FR-18: Add a floor

- **Relevant user roles**

  - Administrator
  - Floor Editor
  - Editor Manager

- **Starting situation (Initial assumption)**

  - Logged in user is either an Administrator, Floor Editor, or Editor Manager.

- **Preconditions**

  - The user has navigated to the floors management section.

- **Normal**

  1. The user clicks the button to add a new floor.
  2. The system shows an editor with a list of furnitures to use to create the floor.
  3. The user clicks in the editor to add a corners of the floor
  4. The user clicks two corners to create a wall of the floor.
  5. The user adds furniture to the floor using the editor.
  6. The user clicks the save button.
  7. The system shows a form to input additional data for the floor.
  8. The user inputs additional data for the new floor (e.g., name, description).
  9. The user clicks the confirm button.
  10. The system validates the input data.
  11. The system saves the new floor.

- **What can go wrong**

  - The user enters invalid data (e.g., missing required fields, incorrect format). An error message is shown.
  - The system fails to save the floor due to a server or network error. An error message is shown.

- **System state on completion**

  - The new floor is saved and displayed in the floors list, or an appropriate error message is shown if the action fails.

### Diagram

Shown from the perspective of the Floor Editor, but it is the same for all other relevant user roles.

![Add a floor diagram](diagrams/add-floor.svg)

# Mockups

## Item Location Mockup

![Item Location Mockup](diagrams/item-location-mockup.svg)

This mockup shows how the item location tracking screen might look.

First, there is a header as is typical in most websites. In the top left corner of the header, there is a logo of the application
that can be clicked to return to the main page. Next to the logo, there is a navigation bar. In the mockup, there is currently
only one button "Items", which leads to the inventory list. Depending on the user role, there can be more buttons in the navigation bar.
As an alternative to the navigation bar if there would be many buttons, there can be a dropdown menu with the buttons. In the top center,
there is a title with the name of the item being tracked. It should prevent the user from being confused if he has multiple tabs
open to track multiple items at once. Then, as is typical in most applications, we get a button in the top right corner, which
opens a menu with the user profile settings and logout button.

Below the header, there is a section with the item location. It shows the floor where the item is located and highlights in color the specific
furniture where the item the user is tracking resides. The floor is shown as was designed in the floor editor, with walls and furniture placed on it.
The highlighted furniture should be clickable, so the user can see even more precise location of the item, such as a specific drawer or shelf.

## Furniture Editor Mockup

![Furniture Editor Mockup](diagrams/furniture-editor-mockup.svg)

This mockup shows how the furniture editor might look.

As usual in most web applications, there is a header. The header contains a logo in the top left corner, which can be clicked to return to the main page.
Beside the logo, there is a navigation bar with buttons to navigate to the shapes and furniture lists. The navigation bar can contain more buttons depending on the user role.
The navigation bar can also be replaced with a dropdown menu if there are too many buttons. Some editors have an input field where the user can easily change the name
of the edited item. Usually, the input field is somewhere in the top left corner of the editor but because we do not want to have the left side of the screen too cluttered,
the input field is placed in the top center of the header. In the top right corner, we have a button that opens a menu with the user profile settings and logout button as
is typical in most applications.

Below the header, there is a section for the editor tools. This location is a wide-spread convention in most editors, so users are used to it. Currently, the tools are
buttons but they could also become a dropdown menu to gather more tools of the same type together. Instead of text, the buttons can also have icons to make the editor look more modern.
The "Placeable zone" is shown as a checkbox, so the user can easily toggle it on and off. As an alternative, it can be changed to a toggle switch, which is more modern and intuitive.

Under the tools section, in the left side of the editor, there is a list of shapes that can be used to create the furniture. The reason is that some editors put the shapes in the tools
section directly, but that makes the tools section very cluttered and even if it is put into its own section in the toolbox, the user has to click through the toolbox to look for what
he is looking for. The shapes list is made to be scrollable, so the user can easily find the shape he is looking for but search box can be added to the top of the list to make it even easier
to find the shape. The list is seperated into 3 sections: "Default", "Custom", and "Public". The "Default" shapes are the shapes that are provided directly by the system.The "Custom" shapes
are the shapes created by the user or by other users of our organization. The "Public" shapes are the shapes that are shared by other organizations and can be used by the user to create furniture.
These sections can be opened and closed by clicking on the section title, so the user can easily hide the sections he does not need at the moment. For simplicity, the shapes list is shown as a list
of buttons with the shape name, but it might be better to use a grid layout with icons representing the shapes, so the user can easily recognize the shape he is looking for.

The rest of the editor is the main area where the user can create the furniture. In the mockup, there is a simple shelf shown. We can see that the construction of the furniture is shown with
white lines, so the user can easily see how the furniture is constructed. In orange lines, the placeable zones are shown, so the user can easily see where the items can be placed on the furniture.
The placeable zones are later used to place the items in the furniture.

## Item List Mockup

![Item List Mockup](diagrams/item-list-mockup.svg)

This mockup shows how the item list might look.

As with the previous mockups, there is a header with a logo in the top left corner, a navigation bar with buttons to navigate and a button in the top right corner to open a menu with user
profile settings and logout button.

Below the header, we have a section to control the item list. Firstly, in the top left corner, we have a title of the section, which is "Items" in this case. The reason is that the user
can have multiple tabs and if the user has permission to also view the other lists, he can easily distinguish which tab is which. Next to the title, there is a search bar, which allows
to quickly search for a specific item in the list. These two elements are on the left side of the section. To make the section look better, the other elements are on the right side of the section.
From the right side, the first element is a button to add a new item. This button might be disabled if the user does not have permission to add items. Next to the button, there is a button
that opens a way to filter the items according to certain criteria. Lastly, there is a small dropdown menu to change the number of items shown on the page.

Below the control section, there is a list of items. The items are shown in a table with columns for the item name, ID, category, quantity, description, location, and actions. The header of the table
with the column names is fixed, so the user can easily see the column names even when scrolling through the list. Additionally, the column names might be clicked to sort according to that column names.
The items are shown in rows, with each row representing an item. The location column contains a button that opens the item location tracking screen when clicked. The actions column contains buttons to
edit and remove the item. In the bottom of the list, there is a pagination section to navigate through the pages of items.

This way of displaying the items is very common in web applications, so users are used to it. It allows the user to easily find the item he is looking for and perform actions on it.
