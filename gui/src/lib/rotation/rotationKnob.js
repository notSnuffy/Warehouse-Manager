/**
 * Radius of the rotation knob
 * @memberof module:rotation
 * @type {number}
 */
const ROTATION_KNOB_RADIUS = 10;

/**
 * Calculate rotation knob position
 * @param {Phaser.GameObjects.Shape} shape - Shape to calculate position for
 * @returns {Point} The position of the rotation knob
 */
function calculateRotationKnobPosition(shape) {
  const topCenter = shape.getTopCenter();
  return {
    x:
      topCenter.x +
      ROTATION_KNOB_RADIUS * 2 * Math.cos(shape.rotation - Math.PI / 2),
    y:
      topCenter.y +
      ROTATION_KNOB_RADIUS * 2 * Math.sin(shape.rotation - Math.PI / 2),
  };
}

/**
 * Updates the rotation knob
 * @param {Phaser.GameObjects.Shape} shape - Shape to update the rotation knob for
 * @param {Phaser.GameObjects.Shape} rotationKnob - Rotation knob
 * @returns {void}
 */
function updateRotationKnob(shape, rotationKnob) {
  const rotationKnobPosition = calculateRotationKnobPosition(shape);
  rotationKnob.setPosition(rotationKnobPosition.x, rotationKnobPosition.y);
}
/**
 * Handles the rotation drag event
 * @param {Phaser.GameObjects.Shape} shape - Shape to rotate
 * @param {Phaser.GameObjects.Shape} rotationKnob - Rotation knob
 * @param {Object} resizeHandles - Resize handles
 * @returns {Function} - Event handler
 *
 */
function handleRotationDrag(shape, rotationKnob, resizeManager) {
  return (_, dragX, dragY) => {
    shape.rotation = Math.atan2(dragY - shape.y, dragX - shape.x);
    updateRotationKnob(shape, rotationKnob);
    resizeManager.updateResizeHandles(shape);
  };
}

/**
 * Creates the rotation knob
 * @param {Phaser.GameObjects.Shape} shape - Shape to create the rotation knob for
 * @param {Phaser.Scene} scene - Scene to create the rotation knob in
 * @returns {void}
 */
function createRotationKnob(shape, scene) {
  const rotationKnobPosition = calculateRotationKnobPosition(shape);
  scene.rotationKnob = scene.add
    .circle(
      rotationKnobPosition.x,
      rotationKnobPosition.y,
      ROTATION_KNOB_RADIUS,
      0x888888,
    )
    .setInteractive({ draggable: true });

  scene.rotationKnob.on("dragstart", () => {
    scene.knobDragging = true;
  });

  scene.rotationKnob.on(
    "drag",
    handleRotationDrag(shape, scene.rotationKnob, scene.resizeManager),
  );

  scene.rotationKnob.on("dragend", () => {
    scene.knobDragging = false;
  });
}

export { ROTATION_KNOB_RADIUS, createRotationKnob, updateRotationKnob };
