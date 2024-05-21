import { Boot } from "./scenes/Boot";
import { Preloader } from "./scenes/Preloader";
import { MainMenu } from "./scenes/MainMenu";
import { Game } from "./scenes/Editor";
import Phaser from "phaser";

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
  scene: [Boot, Preloader, MainMenu, Game],
};

export default new Phaser.Game(config);
