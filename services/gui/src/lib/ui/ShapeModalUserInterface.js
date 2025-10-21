import { renderDynamicModalFields } from "@utils/UIHelperFunctions";
import { DefaultShapeInteractiveConfig } from "@utils/shapes";
import { Modal } from "bootstrap";
import { convertDegreesToRadiansSigned } from "@utils/math";

class ShapeModalUserInterface {
  /**
   * The shape manager instance
   * @type {ShapeManager}
   */
  #shapeManager;

  /**
   * The current shape type being added or edited
   * @type {string|null}
   * @default null
   */
  #currentShapeType = null;

  /**
   * The current shape ID being edited (null if adding a new shape)
   * @type {string|null}
   * @default null
   */
  #currentShapeId = null;

  /**
   * The modal element
   * @type {HTMLElement}
   * @default null
   */
  #modal;

  /**
   * The list of manager IDs to register new shapes with
   * @type {Array}
   * @default []
   */
  #managersToRegisterWith = [];

  /**
   * The scene instance
   * @type {Phaser.Scene}
   * @default null
   */
  #scene;

  /**
   * Creates an instance of ShapeModalUserInterface.
   * @param {ShapeManager} shapeManager - The shape manager instance
   * @param {string} modalId - The ID of the modal element
   * @param {Array} managersToRegisterWith - The list of managers to register new shapes with
   * @param {Phaser.Scene} scene - The scene instance
   */
  constructor(shapeManager, modalId, managersToRegisterWith, scene) {
    this.#shapeManager = shapeManager;
    this.#modal = document.getElementById(modalId);
    const confirmButton = this.#modal.querySelector("#confirmButton");
    confirmButton.addEventListener("click", () => this.onModalConfirmation());
    this.#managersToRegisterWith = managersToRegisterWith;
    this.#scene = scene;
  }

  /**
   * Opens the shape modal for adding or editing a shape.
   * @param {string} shapeType - The type of shape to add or edit
   * @param {string|null} shapeId - The ID of the shape to edit (null if adding a new shape)
   * @param {string} shapeName - The name of the shape to display in the modal title
   * @return {void}
   */
  openShapeModal(shapeType, shapeId, shapeName) {
    this.#currentShapeType = shapeType;
    this.#currentShapeId = shapeId;

    const modalTitle = this.#modal.querySelector("#modalTitle");
    modalTitle.textContent =
      "Add New " + shapeName.charAt(0).toUpperCase() + shapeName.slice(1);

    const dynamicFieldsContainer = this.#modal.querySelector(
      "#dynamicFieldsContainer",
    );

    renderDynamicModalFields(dynamicFieldsContainer, shapeType);

    const bootstrapModal = new Modal(this.#modal);
    bootstrapModal.show();
  }

  /**
   * Handles the confirmation action in the modal.
   * @return {Promise<void>}
   * @private
   */
  async onModalConfirmation() {
    const form = this.#modal.querySelector("#shapeForm");
    console.log(form);
    const formData = new FormData(form);
    console.log(formData);
    const params = Object.fromEntries(formData);

    if (this.#currentShapeId) {
      params.templateId = this.#currentShapeId;
    }

    Object.keys(params).forEach((key) => {
      if (!isNaN(params[key])) {
        params[key] = Number(params[key]);
      }
    });

    if (formData.has("color")) {
      params.color = parseInt(params.color.slice(1), 16);
    }

    if (formData.has("radius")) {
      params.x += params.radius;
      params.y += params.radius;
    }

    if (formData.has("width") && formData.has("height")) {
      params.x += params.width / 2;
      params.y += params.height / 2;
    }

    if (formData.has("rotation")) {
      params.rotation = convertDegreesToRadiansSigned(params.rotation);
    }

    if (formData.has("pointX[]") && formData.has("pointY[]")) {
      params.points = [];
      const xPoints = formData.getAll("pointX[]").map((x) => Number(x));
      const yPoints = formData.getAll("pointY[]").map((y) => Number(y));
      for (let i = 0; i < xPoints.length; i++) {
        params.points.push(xPoints[i]);
        params.points.push(yPoints[i]);
      }
      delete params["pointX[]"];
      delete params["pointY[]"];
    }

    console.log(params);
    if (this.#currentShapeType) {
      const shape = await this.#shapeManager.addShapeHistoryManaged(
        this.#currentShapeType,
        params,
        {
          interactive:
            DefaultShapeInteractiveConfig[this.#currentShapeType.toUpperCase()],
          managers: this.#managersToRegisterWith,
        },
      );
      this.#scene.events.emit("shapeAdded", shape);
    }

    this.#currentShapeType = null;
    const bootstrapModal = Modal.getInstance(this.#modal);
    bootstrapModal.hide();
  }
}

export default ShapeModalUserInterface;
