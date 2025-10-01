import Phaser from "phaser";

/**
 * Manager for camera zooming
 * @class ZoomManager
 */
class ZoomManager {
  /**
   * Zoom step
   * @type {number}
   * @private
   */
  #zoomStep = 0.05;

  /**
   * Constructor
   * @param {Phaser.Scene} scene - The scene
   */
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Zooms the camera towards the pointer position
   * @param {Phaser.Input.Pointer} pointer - The pointer
   * @param {number} deltaY - The wheel delta Y
   * @returns {void}
   * @private
   */
  #zoomTowardsPointer(pointer, deltaY) {
    //const camera = this.scene.cameras.main;

    //const worldPointer = {
    //  x: pointer.worldX,
    //  y: pointer.worldY,
    //};
    //console.log("World pointer:", worldPointer);

    //const zoomDirection = deltaY > 0 ? -1 : 1;
    //let newZoom = camera.zoom + zoomDirection * this.#zoomStep;
    //newZoom = Phaser.Math.Clamp(newZoom, 0.5, 4);
    //console.log("New zoom:", newZoom);

    //camera.setZoom(newZoom);

    //const newWorldPointer = camera.getWorldPoint(
    //  pointer.worldX,
    //  pointer.worldY,
    //);
    //console.log("New world pointer:", newWorldPointer);

    //console.log("Old scroll:", { x: camera.scrollX, y: camera.scrollY });
    //camera.scrollX += worldPointer.x - newWorldPointer.x;
    //camera.scrollY += worldPointer.y - newWorldPointer.y;
    //console.log("New scroll:", { x: camera.scrollX, y: camera.scrollY });

    const camera = this.scene.cameras.main;

    const worldPointer = {
      x: pointer.worldX,
      y: pointer.worldY,
    };

    console.log("Previous scroll:", { x: camera.scrollX, y: camera.scrollY });

    const centerScroll = camera.getScroll(worldPointer.x, worldPointer.y);
    console.log("Center scroll:", centerScroll);
    const previousZoom = camera.zoom;
    console.log("Previous zoom:", previousZoom);

    const zoomDirection = deltaY > 0 ? -1 : 1;
    let newZoom = camera.zoom + zoomDirection * this.#zoomStep;
    newZoom = Phaser.Math.Clamp(newZoom, 0.5, 4);
    camera.setZoom(newZoom);
    console.log("New zoom:", newZoom);

    console.log("World pointer:", worldPointer);

    if (previousZoom === newZoom) {
      return;
    }

    const quadrantX = worldPointer.x >= centerScroll.x ? 1 : -1;
    const quadrantY = worldPointer.y >= centerScroll.y ? 1 : -1;

    const worldPointerOffset = {
      x: worldPointer.x - (camera.width / 2) * quadrantX,
      y: worldPointer.y - (camera.height / 2) * quadrantY,
    };
    console.log("World pointer offset:", worldPointerOffset);

    const adjustedOffset = {
      x: worldPointerOffset.x / newZoom,
      y: worldPointerOffset.y / newZoom,
    };
    console.log("Adjusted offset:", adjustedOffset);

    camera.scrollX = centerScroll.x - adjustedOffset.x;
    camera.scrollY = centerScroll.y - adjustedOffset.y;
    console.log("New scroll:", { x: camera.scrollX, y: camera.scrollY });
  }

  /**
   * Adds camera zoom events
   * @returns {void}
   * @public
   */
  create() {
    this.scene.input.on(
      "wheel",
      (pointer, _gameObjects, _deltaX, deltaY, _deltaZ) => {
        this.#zoomTowardsPointer(pointer, deltaY);
      },
    );
  }
}

export default ZoomManager;
