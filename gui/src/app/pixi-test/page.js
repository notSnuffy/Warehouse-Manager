"use client";
import "@pixi/events";
import { Container, Stage, Graphics, useApp } from "@pixi/react";
import { useCallback, useEffect } from "react";
import { Button } from "primereact/button";
import { addRectangle } from "@/lib/features/shapes/shapesSlice";
import { useDispatch, useSelector, ReactReduxContext } from "react-redux";

const ContextBridge = ({ children, Context, render }) => {
  return (
    <Context.Consumer>
      {(value) =>
        render(<Context.Provider value={value}>{children}</Context.Provider>)
      }
    </Context.Consumer>
  );
};

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

function ShapeContainer({ x, y }) {
  const app = useApp();
  const shapes = useSelector((state) => state.rootReducer.shapes.shapes);

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

  // useEffect(() => {
  //   if (app.stage) {
  //     app.stage.on("pointerup", onDragEnd);
  //     app.stage.on("pointerupoutside", onDragEnd);

  //     return () => {
  //       if (app.stage) {
  //         app.stage.off("pointerupoutside", onDragEnd);
  //         app.stage.off("pointerup", onDragEnd);
  //       }
  //     };
  //   }
  // }, [app, onDragEnd]);

  app.stage.on("pointerup", onDragEnd);
  app.stage.on("pointerupoutside", onDragEnd);

  return (
    <Container x={x} y={y} eventMode={"static"}>
      {shapes.map((shape, index) => (
        <Rectangle
          key={index}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          onDragStart={onDragStart}
        />
      ))}
    </Container>
  );
}

function EditorStage({ children, ...props }) {
  return (
    <ContextBridge
      Context={ReactReduxContext}
      render={(children) => <Stage {...props}>{children}</Stage>}
    >
      {children}
    </ContextBridge>
  );
}

function PixiComponent() {
  const dispatch = useDispatch();

  const onMount = (app) => {
    app.stage.eventMode = "static";
    app.stage.hitArea = app.screen;
  };

  return (
    <>
      <Button label="Add rectangle" onClick={() => dispatch(addRectangle())} />
      <EditorStage x={800} y={600} onMount={onMount}>
        <ShapeContainer x={100} y={100} />
      </EditorStage>
    </>
  );
}

export default PixiComponent;
