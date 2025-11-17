import Phaser from "phaser";
import FloorItemLocation from "@scenes/FloorItemLocation";
import { FurnitureItemLocation } from "@scenes/FurnitureItemLocation";

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
  parent: "itemLocationContainer",
  backgroundColor: "#000000",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [FloorItemLocation, FurnitureItemLocation],
};

export default new Phaser.Game(config);
