import {
  add3,
  Mat4,
  mulMat4,
  mulVec4ByMat4,
  rotate,
  scale3,
  scale4,
  translate,
  Vec3,
  xyz,
} from "../../../src";
import { graphRendererUI } from "./graph-renderer-ui";

export function graphRendererControls(params: {
  canvas: HTMLCanvasElement;
  ui: ReturnType<typeof graphRendererUI>;
}) {
  const { canvas } = params;

  return {
    viewerPos: [0, -150, 0] as Vec3,
    viewerVel: [0, 0, 0] as Vec3,
    rotationMatrix: rotate([1, 0, 0], 0),
    currTransform: translate([0, 0, 0]),
    isDesktop: true,
    keysDown: new Set<string>(),
    moveControls: document.createElement("div"),
    rotateBy(dx: number, dy: number) {
      const localXAxis = mulVec4ByMat4([1, 0, 0, 0], this.rotationMatrix);
      const localYAxis = mulVec4ByMat4([0, -1, 0, 0], this.rotationMatrix);

      const r1 = rotate(xyz(localYAxis), dx);
      const r2 = rotate(xyz(localXAxis), dy);

      this.rotationMatrix = mulMat4(this.rotationMatrix, mulMat4(r1, r2));
    },
    init() {
      document.addEventListener("keydown", (e) => {
        this.keysDown.add(e.key.toLowerCase());
      });
      document.addEventListener("keyup", (e) => {
        this.keysDown.delete(e.key.toLowerCase());
      });

      document.addEventListener("mousedown", (e) => {
        if (!(e.target instanceof HTMLCanvasElement)) {
          return;
        }

        if (this.isDesktop) {
          canvas.requestPointerLock();
        }
      });

      const touches = new Map<number, { touch: Touch }>();

      function updateTouches(e: TouchEvent) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          touches.set(t.identifier, {
            touch: t,
          });
        }
      }

      canvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        updateTouches(e);
      });

      canvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        if (e.changedTouches.length === 1) {
          const t = e.changedTouches[0];
          const prevT = touches.get(t.identifier)?.touch;

          if (prevT) {
            const dx = t.clientX - prevT.clientX;
            const dy = t.clientY - prevT.clientY;

            this.rotateBy(dx * 0.005, -dy * 0.005);
          }
        }
        updateTouches(e);
      });

      canvas.addEventListener("touchend", (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          touches.delete(t.identifier);
        }
      });

      document.addEventListener("mousemove", (e) => {
        if (document.pointerLockElement !== canvas) return;
        this.rotateBy(-e.movementX * 0.003, e.movementY * 0.003);
      });

      document.body.appendChild(this.moveControls);
      this.moveControls.style = `
position: absolute;
bottom: 10px;
left: 10px;    
display: grid;
z-index: 2;
grid-template-areas:
    ". up ."
    ". forward ."
    "left . right"
    ". backward ."
    ". down ."
    `;

      const mappedButton = (text: string, gridArea: string, key: string) => {
        const forwardButton = document.createElement("button");
        forwardButton.innerText = text;
        forwardButton.style = `
grid-area: ${gridArea};    
height: 30px;
border-radius: 5px;
border: 1px solid #888;
background-color: #000a; 
color: white;
margin: 2px;
user-select: none;
-webkit-user-select: none;
-webkit-touch-callout: none;
    `;
        forwardButton.addEventListener("touchstart", () => {
          this.keysDown.add(key);
        });
        forwardButton.addEventListener("touchend", () => {
          this.keysDown.delete(key);
        });

        this.moveControls.appendChild(forwardButton);
      };

      mappedButton("Forward", "forward", "w");
      mappedButton("Left", "left", "a");
      mappedButton("Backward", "backward", "s");
      mappedButton("Right", "right", "d");
      mappedButton("Up", "up", " ");
      mappedButton("Down", "down", "shift");
    },
    updateViewer(dt: number) {
      this.viewerPos = add3(this.viewerPos, scale3(this.viewerVel, dt));

      const accel = scale4(
        mulVec4ByMat4(
          [
            this.keysDown.has("d") ? -1 : this.keysDown.has("a") ? 1 : 0,
            this.keysDown.has("shift") ? 1 : this.keysDown.has(" ") ? -1 : 0,
            this.keysDown.has("w") ? 1 : this.keysDown.has("s") ? -1 : 0,
            0,
          ],
          this.rotationMatrix,
        ),
        params.ui.state.viewerSpeed,
      );

      this.viewerVel = add3(this.viewerVel, xyz(accel));
      this.viewerVel = scale3(this.viewerVel, 0.1 ** dt);
      if (Math.hypot(...this.viewerVel) < 0.2) {
        this.viewerVel = [0, 0, 0];
      }

      this.currTransform = mulMat4(
        this.rotationMatrix,
        translate(this.viewerPos),
      );

      this.isDesktop =
        params.ui.state.uiMode === "auto"
          ? window.matchMedia("(pointer: fine)").matches
          : params.ui.state.uiMode === "desktop";

      if (this.isDesktop) {
        this.moveControls.style.display = "none";
      } else {
        this.moveControls.style.display = "grid";
      }
    },
  };
}
