"use client";
import React from "react";
import "@pixi/events";
import { Container, Stage, Graphics, useApp } from "@pixi/react";
import { useCallback } from "react";

function Rectangle({ x, y, width, height, onDragStart }) {
  const draw = useCallback((g) => {
    g.clear();
    g.beginFill(0xff0000);
    g.drawRect(0, 0, width, height);
    g.endFill();
    g.x = x;
    g.y = y;
    g.pivot.set(width / 2, height / 2);
    g.eventMode = "static";
    g.on("pointerdown", onDragStart);
  }, []);

  return <Graphics draw={draw} />;
}

function ShapeContainer({ x, y, children }) {
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

  app.stage.on("pointerup", onDragEnd);
  app.stage.on("pointerupoutside", onDragEnd);

  console.log(children);

  const childrenWithOnDragStart = React.Children.map(children, (child) => {
    return React.cloneElement(child, { onDragStart });
  });

  return (
    <Container x={x} y={y} eventMode={"static"}>
      {childrenWithOnDragStart}
    </Container>
  );
}

function PixiComponent() {
  const onMount = (app) => {
    app.stage.eventMode = "static";
    app.stage.hitArea = app.screen;
  };

  return (
    <Stage x={800} y={600} onMount={onMount}>
      <ShapeContainer x={100} y={100}>
        <Rectangle x={0} y={0} width={100} height={100} />
        <Rectangle x={200} y={200} width={100} height={100} />
      </ShapeContainer>
    </Stage>
  );
}

export default PixiComponent;
