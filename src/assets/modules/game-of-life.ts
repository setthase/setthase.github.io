import { sizes, type CellState } from "../shared/configuration.js";
import {
  RendererWorkerMessages,
  StateWorkerMessages,
} from "../types/worker.js";

const STATE_WORKER = new Worker("/assets/workers/state.worker.js", {
  name: "Game of Life :: State Manager",
  type: "module",
});

const RENDERER_WORKER = new Worker("/assets/workers/renderer.worker.js", {
  name: "Game of Life :: Offscreen Renderer",
  type: "module",
});

let speedController: HTMLInputElement;
let isPlaying: boolean = true;

async function request<R>(
  worker: Worker,
  message: StateWorkerMessages | RendererWorkerMessages,
  transferable: Transferable[] = [],
): Promise<R> {
  const { port1, port2 } = new MessageChannel();

  return new Promise((resolve, reject) => {
    port1.onmessage = (ev) => {
      port1.close();

      resolve(ev.data);
    };

    port1.onmessageerror = (ev) => {
      port1.close();

      reject(ev.data);
    };

    worker.postMessage(message, [port2, ...transferable]);
  });
}

async function gameLoop() {
  if (isPlaying) {
    const { state } = await request<{ status: "ok"; state: CellState[] }>(
      STATE_WORKER,
      { operation: "next" },
    );

    await request(RENDERER_WORKER, { operation: "render", state });
  }

  setTimeout(
    () => window.requestAnimationFrame(gameLoop),
    parseFloat(speedController.value) * 75,
  );
}

async function main() {
  const element = document.createElement("canvas");

  element.width = sizes.canvas.width;
  element.height = sizes.canvas.height;

  const canvas = element.transferControlToOffscreen();

  await request(STATE_WORKER, { operation: "initiate" });
  await request(RENDERER_WORKER, { operation: "initiate", canvas }, [canvas]);

  document.body.appendChild(element);

  // collect all controllers
  speedController = document.getElementById(
    "speed-controller",
  ) as HTMLInputElement;

  document.getElementById("pause")?.addEventListener("click", (ev) => {
    ev.preventDefault();
    isPlaying = false;
  });

  document.getElementById("resume")?.addEventListener("click", async (ev) => {
    ev.preventDefault();
    isPlaying = true;
  });

  document.getElementById("restart")?.addEventListener("click", async (ev) => {
    ev.preventDefault();
    isPlaying = true;

    await request(STATE_WORKER, { operation: "initiate" });
  });

  // Let's start the party!
  gameLoop();
}

main();
