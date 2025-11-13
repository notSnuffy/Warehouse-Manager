import Phaser from "phaser";
import FloorView from "@scenes/FloorView";
import { FurnitureView } from "@scenes/FurnitureView";

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
  parent: "viewContainer",
  backgroundColor: "#000000",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [FloorView, FurnitureView],
};

export default new Phaser.Game(config);
