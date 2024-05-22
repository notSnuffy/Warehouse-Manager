import Phaser from "phaser";

const UISeperator = 50;
const ROTATION_KNOB_RADIUS = 10;

export class Editor extends Phaser.Scene {
  shapes = [];
  currentTool = "move";
  lastSelected = null;
  rotationKnob = null;
  knobDragging = false;
  resizeHandles = [];
  resizing = false;
  resizeEdge = null;

  constructor() {
    super("Game");
  }

  init(data) {
    this.hello = data;
  }

  create() {
    this.cameras.main.setBackgroundColor(0x000000);

    let moveButton = document.getElementById("move-button");
    moveButton.hidden = false;
    moveButton.addEventListener("click", () => {
      this.currentTool = "move";
    });

    let selectButton = document.getElementById("select-button");
    selectButton.hidden = false;
    selectButton.addEventListener("click", () => {
      this.currentTool = "select";
    });

    this.shapes.push(this.add.rectangle(100, 100, 100, 100, 0xff0000));
    this.shapes.push(this.add.rectangle(300, 300, 100, 100, 0xff0000));
    this.shapes.push(this.add.ellipse(500, 500, 50, 100, 0xff0000));

    for (let i = 0; i < this.shapes.length; i++) {
      let shape = this.shapes[i];
      shape.setInteractive({ draggable: true });

      shape.on("drag", (_, dragX, dragY) => {
        if (this.currentTool === "move") {
          let height = shape.height;
          let width = shape.width;
          let originX = shape.originX;
          let originY = shape.originY;
          if (
            dragY >= UISeperator + height * originY &&
            dragY + height * originY < this.cameras.main.height &&
            dragX + width * originX < this.cameras.main.width &&
            dragX >= width * originX
          ) {
            shape.setPosition(dragX, dragY);
          }
        }
      });

      shape.on("pointerdown", (pointer, x, y, event) => {
        event.stopPropagation();
        if (this.currentTool === "select") {
          if (this.lastSelected) {
            this.lastSelected.setFillStyle(0xff0000);
            if (this.rotationKnob) {
              this.rotationKnob.destroy();
              this.rotationKnob = null;
            }

            this.hideResizeHandles();
          }
          console.log(shape.rotation);
          shape.setFillStyle(0xffffff);
          this.lastSelected = shape;

          this.createResizeHandles(shape);

          console.log(shape.x, shape.y);
          const knobOffset = shape.height / 2 + ROTATION_KNOB_RADIUS;
          this.rotationKnob = this.add
            .circle(
              shape.x + Math.cos(shape.rotation - Math.PI / 2) * knobOffset,
              shape.y + Math.sin(shape.rotation - Math.PI / 2) * knobOffset,
              ROTATION_KNOB_RADIUS,
              0x888888,
            )
            .setInteractive({ draggable: true });

          this.rotationKnob.on("dragstart", () => {
            this.knobDragging = true;
          });

          this.rotationKnob.on(
            "drag",
            this.handleRotationDrag(shape, this.rotationKnob, knobOffset),
          );

          this.rotationKnob.on("dragend", () => {
            this.knobDragging = false;
          });
        }
      });
    }
    this.input.on("pointerdown", this.handleUnselect, this);

    this.space = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.space)) {
      console.log("Shapes:");
      for (let i = 0; i < this.shapes.length; i++) {
        let shape = this.shapes[i];
        console.log(
          "x: ",
          shape.x,
          "y: ",
          shape.y,
          "rotation: ",
          shape.rotation,
          "width: ",
          shape.width,
          "height: ",
          shape.height,
        );
      }
    }
  }

  handleUnselect() {
    if (this.knobDragging || this.resizing) {
      return;
    }
    console.log("unselecting");
    if (this.lastSelected) {
      this.lastSelected.setFillStyle(0xff0000);
      this.lastSelected = null;
    }
    if (this.rotationKnob) {
      this.rotationKnob.destroy();
      this.rotationKnob = null;
    }

    this.hideResizeHandles();
  }

  handleRotationDrag(shape, rotationKnob, knobOffset) {
    return (_, dragX, dragY) => {
      shape.rotation = Math.atan2(dragY - shape.y, dragX - shape.x);
      this.updateRotationKnob(shape, rotationKnob, knobOffset);
      this.updateResizeHandles(shape);
    };
  }

  updateRotationKnob(shape, rotationKnob, knobOffset) {
    rotationKnob.setPosition(
      shape.x + Math.cos(shape.rotation) * knobOffset,
      shape.y + Math.sin(shape.rotation) * knobOffset,
    );
  }

  createResizeHandles(shape) {
    const handles = [
      {
        x: shape.x - shape.width / 2,
        y: shape.y - shape.height / 2,
        width: 10,
        height: 10,
      }, // Top-left
      {
        x: shape.x + shape.width / 2,
        y: shape.y - shape.height / 2,
        width: 10,
        height: 10,
      }, // Top-right
      {
        x: shape.x + shape.width / 2,
        y: shape.y + shape.height / 2,
        width: 10,
        height: 10,
      }, // Bottom-right
      {
        x: shape.x - shape.width / 2,
        y: shape.y + shape.height / 2,
        width: 10,
        height: 10,
      }, // Bottom-left
      {
        x: shape.x,
        y: shape.y - shape.height / 2,
        width: shape.width - 10,
        height: 2,
      }, // Top
      {
        x: shape.x + shape.width / 2,
        y: shape.y,
        width: 2,
        height: shape.height - 10,
      }, // Right
      {
        x: shape.x,
        y: shape.y + shape.height / 2,
        width: shape.width - 10,
        height: 2,
      }, // Bottom
      {
        x: shape.x - shape.width / 2,
        y: shape.y,
        width: 2,
        height: shape.height - 10,
      }, // Left
    ];

    const cursorStyles = [
      "nwse-resize",
      "nesw-resize",
      "nwse-resize",
      "nesw-resize",
      "ns-resize",
      "ew-resize",
      "ns-resize",
      "ew-resize",
    ];

    for (let i = 0; i < handles.length; i++) {
      const handle = handles[i];
      const resizeHandle = this.add
        .rectangle(handle.x, handle.y, handle.width, handle.height, 0x888888)
        .setInteractive({ cursor: cursorStyles[i], draggable: true });

      resizeHandle.on("dragstart", () => {
        console.log("dragstart");
        this.resizing = true;
        this.resizeEdge = i;
      });

      resizeHandle.on("drag", (_, dragX, dragY) => {
        if (this.currentTool === "select") {
          let width, height, newX, newY;
          const old_width = shape.width;
          const old_height = shape.height;
          switch (this.resizeEdge) {
            case 0: // Top-left
              width = shape.x - dragX + shape.width / 2;
              height = shape.y - dragY + shape.height / 2;
              newX = dragX + width / 2;
              newY = dragY + height / 2;
              break;
            case 1: // Top-right
              width = dragX - shape.x + shape.width / 2;
              height = shape.y - dragY + shape.height / 2;
              newX = shape.x + (width - old_width) / 2;
              newY = dragY + height / 2;
              break;
            case 2: // Bottom-right
              width = dragX - shape.x + shape.width / 2;
              height = dragY - shape.y + shape.height / 2;
              newX = shape.x + (width - old_width) / 2;
              newY = shape.y + (height - old_height) / 2;
              break;
            case 3: // Bottom-left
              width = shape.x - dragX + shape.width / 2;
              height = dragY - shape.y + shape.height / 2;
              newX = dragX + width / 2;
              newY = shape.y + (height - old_height) / 2;
              break;
            case 4: // Top
              width = shape.width;
              height = shape.y - dragY + shape.height / 2;
              newX = shape.x;
              newY = dragY + height / 2;
              break;
            case 5: // Right
              width = dragX - shape.x + shape.width / 2;
              height = shape.height;
              newX = shape.x + (width - old_width) / 2;
              newY = shape.y;
              break;
            case 6: // Bottom
              width = shape.width;
              height = dragY - shape.y + shape.height / 2;
              newX = shape.x;
              newY = shape.y + (height - old_height) / 2;
              break;
            case 7: // Left
              width = shape.x - dragX + shape.width / 2;
              height = shape.height;
              newX = dragX + width / 2;
              newY = shape.y;
              break;
          }
          shape.setSize(width, height);
          shape.setPosition(newX, newY);
          this.updateResizeHandles(shape);
          const knobOffset = shape.height / 2 + ROTATION_KNOB_RADIUS;
          this.rotationKnob.setPosition(
            shape.x + Math.cos(shape.rotation - Math.PI / 2) * knobOffset,
            shape.y + Math.sin(shape.rotation - Math.PI / 2) * knobOffset,
          );
        }
      });

      resizeHandle.on("dragend", () => {
        this.resizing = false;
        this.resizeEdge = null;
      });

      this.resizeHandles.push(resizeHandle);
    }
  }

  hideResizeHandles() {
    for (let i = 0; i < this.resizeHandles.length; i++) {
      const handle = this.resizeHandles[i];
      handle.destroy();
    }
    this.resizeHandles = [];
  }

  updateResizeHandles(shape) {
    const handles = [
      {
        x: shape.x - shape.width / 2,
        y: shape.y - shape.height / 2,
        width: 10,
        height: 10,
      }, // Top-left
      {
        x: shape.x + shape.width / 2,
        y: shape.y - shape.height / 2,
        width: 10,
        height: 10,
      }, // Top-right
      {
        x: shape.x + shape.width / 2,
        y: shape.y + shape.height / 2,
        width: 10,
        height: 10,
      }, // Bottom-right
      {
        x: shape.x - shape.width / 2,
        y: shape.y + shape.height / 2,
        width: 10,
        height: 10,
      }, // Bottom-left
      {
        x: shape.x,
        y: shape.y - shape.height / 2,
        width: shape.width - 10,
        height: 2,
      }, // Top
      {
        x: shape.x + shape.width / 2,
        y: shape.y,
        width: 2,
        height: shape.height - 10,
      }, // Right
      {
        x: shape.x,
        y: shape.y + shape.height / 2,
        width: shape.width - 10,
        height: 2,
      }, // Bottom
      {
        x: shape.x - shape.width / 2,
        y: shape.y,
        width: 2,
        height: shape.height - 10,
      }, // Left
    ];

    for (let i = 0; i < this.resizeHandles.length; i++) {
      const handle = this.resizeHandles[i];
      handle.setPosition(handles[i].x, handles[i].y);
      handle.setSize(handles[i].width, handles[i].height);
    }
  }
}
