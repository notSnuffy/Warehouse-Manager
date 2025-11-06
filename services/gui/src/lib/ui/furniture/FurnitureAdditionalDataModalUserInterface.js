import TopDownViewDataListUserInterface from "@ui/furniture/TopDownViewDataListUserInterface";
import { Modal } from "bootstrap";

/**
 * Class representing the furniture additional data modal.
 * @class FurnitureAdditionalDataModalUserInterface
 */
class FurnitureAdditionalDataModalUserInterface {
  /**
   * The modal HTML element.
   * @type {HTMLElement}
   */
  #modalElement;

  /**
   * The top-down view data list user interface.
   * @type {TopDownViewDataListUserInterface}
   */
  #topDownViewDataList;

  /**
   * The furniture save button user interface.
   * @type {FurnitureSaveButtonUserInterface}
   */
  #saveButton;

  /**
   * Pending furniture data
   * @type {Object|null}
   */
  #pendingFurniture;

  /**
   * The confirm button HTML element.
   * @type {HTMLElement}
   */
  #confirmButton;

  /**
   * Creates an instance of FurnitureAdditionalDataModalUserInterface.
   * @param {string} modalId - The ID of the modal element.
   * @param {string} topDownViewInputId - The ID of the top-down view input element.
   * @param {string} topDownViewDataListId - The ID of the top-down view data list element.
   * @param {string} shapeListElementId - The ID of the shape list element.
   * @param {FurnitureSaveButtonUserInterface} saveButton - The furniture save button user interface.
   */
  constructor(
    modalId,
    topDownViewInputId,
    topDownViewDataListId,
    shapeListElementId,
    saveButton,
  ) {
    this.#modalElement = document.getElementById(modalId);
    this.#saveButton = saveButton;
    this.#confirmButton = this.#modalElement.querySelector(".confirm-button");
    this.#topDownViewDataList = new TopDownViewDataListUserInterface(
      topDownViewInputId,
      topDownViewDataListId,
    );
    this.#topDownViewDataList.populateFromShapeList(shapeListElementId);
    this.#initializeConfirmButtonListener();
  }

  /**
   * Shows the modal with the given furniture data.
   * @param {Object} furnitureData - The furniture data prepared for editing with the additional data modal.
   */
  showModal(furnitureData) {
    this.#pendingFurniture = furnitureData;
    const modal = new Modal(this.#modalElement);
    modal.show();
  }

  /**
   * Hides the modal.
   */
  hideModal() {
    const modal = Modal.getInstance(this.#modalElement);
    if (!modal) {
      return;
    }
    modal.hide();
  }

  #initializeConfirmButtonListener() {
    this.#confirmButton.addEventListener("click", async () => {
      if (!this.#pendingFurniture) {
        return;
      }

      const selectedShapeName = this.#topDownViewDataList.getSelectedItemName();
      if (!selectedShapeName) {
        alert("Please select a valid shape for the top-down view.");
        return;
      }

      const shapeId =
        this.#topDownViewDataList.getShapeIdByName(selectedShapeName);
      if (!shapeId) {
        console.error(
          "Shape ID not found for the selected shape name:",
          selectedShapeName,
        );
        alert("Selected shape is invalid. Please choose a different shape.");
        return;
      }

      this.#pendingFurniture.topDownViewId = shapeId;

      await this.#saveButton.saveFurniture(this.#pendingFurniture);
      this.#pendingFurniture = null;
      this.hideModal();
    });
  }
}

export default FurnitureAdditionalDataModalUserInterface;
