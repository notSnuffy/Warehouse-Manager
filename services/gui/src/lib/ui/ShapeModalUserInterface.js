import { renderDynamicModalFields } from "@utils/UIHelperFunctions";
import { DefaultShapeInteractiveConfig } from "@utils/shapes";
import { Modal } from "bootstrap";
import { convertDegreesToRadiansSigned } from "@utils/math";

class ShapeModalUserInterface {
  /**
   * The shape manager instance
   * @type {ShapeManager}
   */
  shapeManager;

  /**
   * The UndoRedoManager instance
   * @type {UndoRedoManager}
   */
  undoRedoManager;

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
  managersToRegisterWith = [];

  /**
   * The shape fields schemas
   * @type {Object}
   * @default {}
   */
  #shapeFieldsSchemas = {};

  /**
   * Creates an instance of ShapeModalUserInterface.
   * @param {ShapeManager} shapeManager - The shape manager instance
   * @param {UndoRedoManager} undoRedoManager - The UndoRedoManager instance
   * @param {string} modalId - The ID of the modal element
   * @param {Array} managersToRegisterWith - The list of managers to register new shapes with
   * @param {Object} shapeFieldsSchemas - The shape fields schemas
   */
  constructor(
    shapeManager,
    undoRedoManager,
    modalId,
    managersToRegisterWith,
    shapeFieldsSchemas,
  ) {
    this.shapeManager = shapeManager;
    this.undoRedoManager = undoRedoManager;
    this.#modal = document.getElementById(modalId);
    const confirmButton = this.#modal.querySelector("#confirmButton");
    confirmButton.addEventListener("click", () => this.onModalConfirmation());
    this.managersToRegisterWith = managersToRegisterWith;
    this.#shapeFieldsSchemas = shapeFieldsSchemas;
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

    renderDynamicModalFields(
      dynamicFieldsContainer,
      this.#shapeFieldsSchemas,
      shapeType.toUpperCase(),
    );

    const bootstrapModal = new Modal(this.#modal);
    bootstrapModal.show();
  }

  /**
   * Handles the confirmation action in the modal.
   * @return {Promise<void>}
   * @private
   */
  async onModalConfirmation() {
    console.log(this.#modal);
    const form = this.#modal.querySelector("#shapeForm");
    const isValid = form.checkValidity();
    if (!isValid) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
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

    if (this.#currentShapeType) {
      await this.handleAddShape(this.#currentShapeType, params);
    }

    this.#currentShapeType = null;
    const bootstrapModal = Modal.getInstance(this.#modal);
    bootstrapModal.hide();
  }

  /**
   * Handles adding a shape to the scene.
   * Intended to be overridden by subclasses for custom behavior.
   * @param {string} shapeType - The type of shape to add.
   * @param {Object} params - The parameters for creating the shape.
   * @returns {Promise<void>}
   * @virtual
   */
  async handleAddShape(shapeType, params) {
    const result = await this.shapeManager.addShapeWithCommand(
      shapeType,
      params,
      {
        interactive: DefaultShapeInteractiveConfig[shapeType.toUpperCase()],
        managers: this.managersToRegisterWith,
      },
      true,
    );
    this.undoRedoManager.pushCommand(result.command);
  }
}

export default ShapeModalUserInterface;
