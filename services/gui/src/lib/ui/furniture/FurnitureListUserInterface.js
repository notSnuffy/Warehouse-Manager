/**
 * Class representing the user interface for the furniture list.
 * @class FurnitureListUserInterface
 */
class FurnitureListUserInterface {
  /**
   * The container element for the furniture list.
   * @type {HTMLElement}
   */
  #listContainer;

  /**
   * The button click handler function.
   * @type {Function}
   */
  #buttonClickHandler;

  /**
   * The URL for furniture management API.
   * @type {string}
   */
  #furnitureManagementURL;

  /**
   * Creates an instance of FurnitureListUserInterface.
   * @param {string} listContainerId - The ID of the container element for the furniture list.
   * @param {Function} buttonClickHandler - The function to handle button clicks.
   * @param {string} furnitureManagementURL - The URL for furniture management API.
   */
  constructor(
    listContainerId,
    buttonClickHandler,
    furnitureManagementURL = "",
  ) {
    this.#listContainer = document.getElementById(listContainerId);
    this.#buttonClickHandler = buttonClickHandler;
    this.#furnitureManagementURL = furnitureManagementURL;
  }

  /**
   * Initializes the furniture list user interface.
   * @return {Promise<void>}
   */
  async initialize() {
    await this.#initializeFurnitureList();
  }

  /**
   * Initializes the furniture list by fetching furniture items.
   * @return {Promise<void>}
   */
  async #initializeFurnitureList() {
    try {
      const response = await fetch(this.#furnitureManagementURL);
      const data = await response.json();
      if (!response.ok) {
        if (data.errors && data.errors.length > 0) {
          alert(data.errors.join("\n"));
        }
        console.error("Error fetching furniture:", data);
        return;
      }

      data.forEach((furniture) => {
        this.addFurnitureIntoList(furniture.name, furniture.id);
      });
    } catch (error) {
      console.error("Error fetching furniture:", error);
      alert("Error fetching furniture: " + error.message);
    }
  }

  /**
   * Adds furniture into the list.
   * @param {string} name - The name of the furniture.
   * @param {string} id - The ID of the furniture.
   * @return {void}
   */
  addFurnitureIntoList(name, id) {
    const newFurnitureButton = document.createElement("button");
    newFurnitureButton.classList.add("btn", "btn-secondary", "mb-2");
    newFurnitureButton.dataset.furniture = name;
    newFurnitureButton.dataset.id = id;
    newFurnitureButton.textContent = name;
    newFurnitureButton.id = "add-" + id;
    newFurnitureButton.addEventListener(
      "click",
      function () {
        this.#buttonClickHandler("custom", id, name);
      }.bind(this),
    );
    this.#listContainer.appendChild(newFurnitureButton);
  }
}

export default FurnitureListUserInterface;
