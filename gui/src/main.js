import { Boot } from "./scenes/Boot";
import { Preloader } from "./scenes/Preloader";
import { MainMenu } from "./scenes/MainMenu";
import { Editor } from "./scenes/Editor";
import Phaser from "phaser";

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
