import "../styles.scss";
import * as _bootstrap from "bootstrap";
import { API_URL } from "../config";

const shapeListElement = document.getElementById("shapeList");

const shapes = [];

fetchShapes();

async function fetchShapes() {
  try {
    const response = await fetch(API_URL + "/shape-management/shapes");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    shapeListElement.innerHTML = ""; // Clear the list before adding new shapes
    data.forEach((shape) => {
      addShapeToList(shape);
      shapes.push(shape);
    });
  } catch (error) {
    console.error("Error fetching shapes:", error);
  }
}
function editShape(id) {
  console.log("Edit shape with ID:", id);
  // Implement the edit functionality here
}

function removeShape(id) {
  console.log("Remove shape with ID:", id);
  // Implement the remove functionality here
}

function addShapeToList(shape) {
  const li = document.createElement("li");
  li.textContent = shape.name;
  li.classList.add("list-group-item");

  const editButton = document.createElement("button");
  editButton.textContent = "Edit";
  editButton.classList.add("btn", "btn-primary", "btn-sm", "float-end", "me-2");
  editButton.addEventListener("click", () => editShape(shape.id));

  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.classList.add("btn", "btn-danger", "btn-sm", "float-end");
  removeButton.addEventListener("click", () => removeShape(shape.id));

  const buttonGroup = document.createElement("div");
  buttonGroup.classList.add("btn-group", "float-end");
  buttonGroup.appendChild(editButton);
  buttonGroup.appendChild(removeButton);

  li.appendChild(buttonGroup);

  shapeListElement.appendChild(li);
}
