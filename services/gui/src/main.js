import { Boot } from "./scenes/Boot";
import { Preloader } from "./scenes/Preloader";
import { ShapeEditor } from "./scenes/ShapeEditor";
import Phaser from "phaser";
import "./styles.scss";
import * as _bootstrap from "bootstrap";

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
  width: "100%",
  height: "100%",
};

const config = {
  type: Phaser.AUTO,
  width: window_size.width,
  height: window_size.height,
  parent: "editorContainer",
  backgroundColor: "#028af8",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Boot, Preloader, ShapeEditor],
};

export default new Phaser.Game(config);
