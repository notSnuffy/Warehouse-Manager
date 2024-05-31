import { Boot } from "./scenes/Boot";
import { Preloader } from "./scenes/Preloader";
import { MainMenu } from "./scenes/MainMenu";
import { Editor } from "./scenes/Editor";
import Phaser from "phaser";
import "./styles.scss";
import * as bootstrap from "bootstrap";

/**
 * @module resize
 * @requires Phaser
 * @description This module provides functions for resizing shapes
 */

/**
 * @module types
 * @description This module provides types for the editor
 */

/**
 * @module points
 * @description This module provides functions for points
 */

/**
 * @module rotation
 * @requires Phaser
 * @description This module provides functions for rotating shapes
 */

/**
 * @module shapes
 * @requires Phaser
 * @description This module provides functions for shapes
 */

/**
 * @module move
 * @requires Phaser
 * @description This module provides functions for moving shapes
 */

/**
 * @module select
 * @reguires Phaser
 * @description This module provides functions for selecting shapes
 */

/**
 * @module line
 * @requires Phaser
 * @description This module provides functions for lines
 */

const window_size = {
  width: 1024,
  height: 768,
};

const config = {
  type: Phaser.AUTO,
  width: window_size.width,
  height: window_size.height,
  parent: "editor-container",
  backgroundColor: "#028af8",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Boot, Preloader, MainMenu, Editor],
};

export default new Phaser.Game(config);

function showModal(button) {
  const shape = button.getAttribute("data-shape");
  const modalElement = document.getElementById("newShapeModal");
  const shapeTypeInput = document.getElementById("shapeType");
  const modalTitle = document.getElementById("newShapeModalLabel");

  modalTitle.textContent =
    "Add New " + shape.charAt(0).toUpperCase() + shape.slice(1);
  shapeTypeInput.value = shape;

  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}

document
  .getElementById("saveShapeButton")
  .addEventListener("click", function () {
    const shapeType = document.getElementById("shapeType").value;
    const x = document.getElementById("shapeX").value;
    const y = document.getElementById("shapeY").value;
    const width = document.getElementById("shapeWidth").value;
    const height = document.getElementById("shapeHeight").value;

    window.addShape(shapeType, {
      x: parseInt(x),
      y: parseInt(y),
      width: parseInt(width),
      height: parseInt(height),
    });

    const modalElement = document.getElementById("newShapeModal");
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
  });

window.showModal = showModal;
