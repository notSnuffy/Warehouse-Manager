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
    const camera = this.scene.cameras.main;

    const oldZoom = camera.zoom;

    const zoomDirection = deltaY > 0 ? -1 : 1;
    let newZoom = camera.zoom + zoomDirection * this.#zoomStep;
    newZoom = Phaser.Math.Clamp(newZoom, 0.5, 4);

    const cameraPointerPosition = {
      x: pointer.x,
      y: pointer.y,
    };

    const cameraCenter = {
      x: camera.centerX,
      y: camera.centerY,
    };

    const pointerOffsetFromCenter = {
      x: cameraPointerPosition.x - cameraCenter.x,
      y: cameraPointerPosition.y - cameraCenter.y,
    };

    const pointerOffsetFromCenterRatio = {
      x: pointerOffsetFromCenter.x / camera.width,
      y: pointerOffsetFromCenter.y / camera.height,
    };

    const pixelDifferenceAfterZoom = {
      width: camera.width / oldZoom - camera.width / newZoom,
      height: camera.height / oldZoom - camera.height / newZoom,
    };

    const scrollAdjustment = {
      x: pixelDifferenceAfterZoom.width * pointerOffsetFromCenterRatio.x,
      y: pixelDifferenceAfterZoom.height * pointerOffsetFromCenterRatio.y,
    };

    camera.setZoom(newZoom);
    camera.scrollX += scrollAdjustment.x;
    camera.scrollY += scrollAdjustment.y;
    this.scene.events.emit("cameraZoomChanged", camera.zoom);
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
