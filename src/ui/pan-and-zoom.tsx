import { ReactNode, useEffect, useRef, useState } from "react";
import { lerp, rescale } from "../interpolation";
import { Mat3x2 } from "../math/vector";

export type Rect = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export function panAndZoomMatrix(
  rect: Rect,
  containerWidth: number,
  containerHeight: number
): Mat3x2 {
  const scaleX = (1 / (rect.x2 - rect.x1)) * containerWidth;
  const scaleY = (1 / (rect.y2 - rect.y1)) * containerHeight;

  const translateX = -rect.x1 * scaleX;
  const translateY = -rect.y1 * scaleY;

  return [scaleX, 0, 0, scaleY, translateX, translateY];
}

export function panAndZoomCanvas2d(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  rect: Rect
) {
  ctx.transform(...panAndZoomMatrix(rect, canvas.width, canvas.height));
}

export function PanAndZoom(props: {
  children: ReactNode;
  coords: Rect;
  setCoords: React.Dispatch<React.SetStateAction<Rect>>;
  onUpdate?: () => void;
  scrollSensitivity?: number;
  scrollDecay?: number;
  scrollSnapToZero?: number;
  swapScroll?: boolean;
}) {
  const scrollSensitivity = props.scrollSensitivity ?? 1;
  const scrollDecay = props.scrollDecay ?? 0.01;
  const scrollSnapToZero = props.scrollSnapToZero ?? 0.001;
  const scrollVel = useRef(0);
  const mouseDown = useRef(false);
  const normalizedMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let stopped = false;
    let lastTime = performance.now();
    const cb = (time) => {
      if (stopped) return;
      const deltaTime = time - lastTime;
      lastTime = time;
      scrollVel.current *= Math.pow(scrollDecay, deltaTime / 1000);

      if (Math.abs(scrollVel.current) > scrollSnapToZero) {
        props.setCoords((c) => {
          const targetOriginX = lerp(normalizedMousePos.current.x, c.x1, c.x2);
          const targetOriginY = lerp(normalizedMousePos.current.y, c.y1, c.y2);
          const scrollAmount = (scrollVel.current * deltaTime) / 1000;
          return {
            x1: lerp(scrollAmount, c.x1, targetOriginX),
            y1: lerp(scrollAmount, c.y1, targetOriginY),
            x2: lerp(scrollAmount, c.x2, targetOriginX),
            y2: lerp(scrollAmount, c.y2, targetOriginY),
          };
        });
        props.onUpdate?.();
      }

      requestAnimationFrame(cb);
    };
    requestAnimationFrame(cb);
    return () => {
      stopped = true;
    };
  }, []);

  const divref = useRef<HTMLDivElement | null>(null);

  return (
    <div
      style={{
        width: "fit-content",
        display: "flex",
      }}
      ref={divref}
      onWheel={(e) => {
        e.preventDefault();
        scrollVel.current +=
          Math.sign(e.deltaY) * scrollSensitivity * (props.swapScroll ? -1 : 1);
      }}
      onMouseDown={(e) => {
        mouseDown.current = true;
      }}
      onMouseUp={(e) => {
        mouseDown.current = false;
      }}
      onMouseMove={(e) => {
        const rect = divref.current?.getBoundingClientRect();
        if (!rect) return;
        normalizedMousePos.current = {
          x: rescale(e.nativeEvent.offsetX, 0, rect.width, 0, 1),
          y: rescale(e.nativeEvent.offsetY, 0, rect.height, 0, 1),
        };
        if (!mouseDown.current) return;
        props.setCoords((c) => {
          const dx = -rescale(e.movementX, 0, rect.width, 0, c.x2 - c.x1);
          const dy = -rescale(e.movementY, 0, rect.height, 0, c.y2 - c.y1);

          return {
            x1: c.x1 + dx,
            y1: c.y1 + dy,
            x2: c.x2 + dx,
            y2: c.y2 + dy,
          };
        });
        props.onUpdate?.();
      }}
    >
      {props.children}
    </div>
  );
}
