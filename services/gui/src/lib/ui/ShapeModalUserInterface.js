import { renderDynamicModalFields } from "@utils/UIHelperFunctions";
import { DefaultShapeInteractiveConfig } from "@utils/shapes";
import { Modal } from "bootstrap";
import { convertDegreesToRadiansSigned } from "@utils/math";

class ShapeModalUserInterface {
  #shapeManager;

  #currentShapeType = null;

  #currentShapeId = null;

  #modal;

  #managersToRegisterWith = [];

  constructor(shapeManager, modalId, managersToRegisterWith) {
    this.#shapeManager = shapeManager;
    this.#modal = document.getElementById(modalId);
    const confirmButton = this.#modal.querySelector("#confirmButton");
    confirmButton.addEventListener("click", () => this.onModalConfirmation());
    this.#managersToRegisterWith = managersToRegisterWith;
  }

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
        },
      );
      for (const manager of this.#managersToRegisterWith) {
        manager.create(shape);
      }
    }

    this.#currentShapeType = null;
    const bootstrapModal = Modal.getInstance(this.#modal);
    bootstrapModal.hide();
  }
}

export default ShapeModalUserInterface;
