"use client";
import "@pixi/events";
import { Stage, Graphics, useApp } from "@pixi/react";
import { useCallback } from "react";

function Rectangle() {
  const app = useApp();

  let dragTarget = null;
  const onDragMove = (event) => {
    if (dragTarget) {
      dragTarget.parent.toLocal(event.data.global, null, dragTarget.position);
    }
  };

  const onDragStart = (event) => {
    const target = event.currentTarget;
    target.alpha = 0.5;
    dragTarget = target;
    app.stage.on("pointermove", onDragMove);
  };

  const onDragEnd = (event) => {
    if (dragTarget) {
      dragTarget.alpha = 1;
      dragTarget = null;
      app.stage.off("pointermove", onDragMove);
    }
  };

  const draw = useCallback(
    (g) => {
      g.clear();
      g.beginFill(0xff0000);
      g.drawRect(0, 0, 100, 100);
      g.endFill();
      g.x = 100;
      g.y = 100;
      g.pivot.set(50, 50);
      g.eventMode = "static";
      g.on("pointerdown", onDragStart);
      app.stage.on("pointerup", onDragEnd);
      app.stage.on("pointerupoutside", onDragEnd);
    },
    [app.stage],
  );

  return <Graphics draw={draw} />;
}

function PixiComponent() {
  const onMount = (app) => {
    app.stage.eventMode = "static";
    app.stage.hitArea = app.screen;
  };
  return (
    <Stage x={800} y={600} onMount={onMount}>
      <Rectangle />
      <Rectangle />
    </Stage>
  );
}

export default PixiComponent;
