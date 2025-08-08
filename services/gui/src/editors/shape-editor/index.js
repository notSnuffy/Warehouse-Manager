import { Boot } from "../../scenes/Boot";
import { Preloader } from "../../scenes/Preloader";
import { ShapeEditor } from "../../scenes/ShapeEditor";
import Phaser from "phaser";
import "./styles.scss";
import * as _bootstrap from "bootstrap";

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
