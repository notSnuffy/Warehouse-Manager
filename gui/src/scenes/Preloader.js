import { Scene } from "phaser";
import { API_URL } from "../config";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", (progress) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {}

  async create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    const response = await fetch(API_URL);
    const _data = await response.json();

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    // this.scene.start("MainMenu", { ...data });
    this.scene.start("MainMenu");
  }
}
