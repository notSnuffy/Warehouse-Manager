import { Scene } from "phaser";

const UISeperator = 50;

export class Game extends Scene {
  rectangles = [];
  currentTool = "move";
  lastSelected = null;
  rotationKnob = null;
  knobDragging = false;

  constructor() {
    super("Game");
  }

  init(data) {
    this.hello = data;
  }

  create() {
    this.cameras.main.setBackgroundColor(0x000000);

    let moveButton = this.add
      .text(20, 20, "Move", { color: "#ffffff" })
      .setInteractive();
    let selectButton = this.add
      .text(80, 20, "Select", { color: "#ffffff" })
      .setInteractive();

    moveButton.on("pointerdown", () => {
      this.currentTool = "move";
    });

    selectButton.on("pointerdown", () => {
      this.currentTool = "select";
    });

    this.rectangles.push(this.add.rectangle(100, 100, 100, 100, 0xff0000));
    this.rectangles.push(this.add.rectangle(300, 300, 100, 100, 0xff0000));

    for (let i = 0; i < this.rectangles.length; i++) {
      let rectangle = this.rectangles[i];
      rectangle.setInteractive({ draggable: true });

      rectangle.on("drag", (_, dragX, dragY) => {
        if (this.currentTool === "move") {
          let height = rectangle.height;
          let width = rectangle.width;
          let originX = rectangle.originX;
          let originY = rectangle.originY;
          if (
            dragY >= UISeperator + height * originY &&
            dragY + height * originY < this.cameras.main.height &&
            dragX + width * originX < this.cameras.main.width &&
            dragX >= width * originX
          ) {
            rectangle.setPosition(dragX, dragY);
          }
        }
      });

      rectangle.on("pointerdown", (pointer, x, y, event) => {
        event.stopPropagation();
        if (this.currentTool === "select") {
          if (this.lastSelected) {
            this.lastSelected.setFillStyle(0xff0000);
            if (this.rotationKnob) {
              this.rotationKnob.destroy();
              this.rotationKnob = null;
            }
          }
          console.log(rectangle.rotation);
          rectangle.setFillStyle(0xffffff);
          this.lastSelected = rectangle;

          console.log(rectangle.x, rectangle.y);
          const radius = 10;
          const knobOffset = rectangle.height / 2 + radius;
          this.rotationKnob = this.add
            .circle(
              rectangle.x +
                Math.cos(rectangle.rotation - Math.PI / 2) * knobOffset,
              rectangle.y +
                Math.sin(rectangle.rotation - Math.PI / 2) * knobOffset,
              radius,
              0x888888,
            )
            .setInteractive({ draggable: true });

          this.rotationKnob.on("dragstart", () => {
            this.knobDragging = true;
          });

          this.rotationKnob.on("drag", (pointer, dragX, dragY) => {
            rectangle.rotation = Math.atan2(
              dragY - rectangle.y,
              dragX - rectangle.x,
            );
            this.rotationKnob.setPosition(
              rectangle.x + Math.cos(rectangle.rotation) * knobOffset,
              rectangle.y + Math.sin(rectangle.rotation) * knobOffset,
            );
          });

          this.rotationKnob.on("dragend", () => {
            this.knobDragging = false;
          });
        }
      });
    }
    this.input.on("pointerdown", (_) => {
      console.log("pointerdown");
      if (this.knobDragging) {
        return;
      }

      if (this.lastSelected) {
        this.lastSelected.setFillStyle(0xff0000);
        this.lastSelected = null;
      }
      if (this.rotationKnob) {
        this.rotationKnob.destroy();
        this.rotationKnob = null;
      }
    });
  }
}
