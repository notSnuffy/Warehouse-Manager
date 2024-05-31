import { Scene } from "phaser";

export class Boot extends Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
    //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.
  }

  create() {
    let menuBar = document.getElementById("menu-bar");
    menuBar.hidden = true;
    let itemsMenu = document.getElementById("items-menu");
    itemsMenu.hidden = true;

    this.scene.start("Preloader");
  }
}
