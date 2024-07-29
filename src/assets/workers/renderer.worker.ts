/// <reference lib="webworker" />

import { CellState, sizes } from "../shared/configuration.js";
import type {
  RendererWorkerMessage,
  RendererWorkerMessages,
} from "../types/worker.js";

const CellColour = {
  [CellState.ALIVE]: "#ff8080",
  [CellState.DEAD]: "#303030",
};

let canvas: OffscreenCanvas;

function renderGridInCanvas(
  cells: CellState[],
  context: OffscreenCanvasRenderingContext2D,
) {
  context.clearRect(0, 0, sizes.canvas.width, sizes.canvas.height);

  cells.forEach((state, index) => {
    const [x, y] = getCoordinatesFromIndex(index);

    context.beginPath();
    context.arc(
      x * sizes.cell.width * 2 + sizes.cell.width,
      y * sizes.cell.height * 2 + sizes.cell.height,
      sizes.cell.width / 1.5,
      0,
      2 * Math.PI,
      false,
    );

    context.fillStyle = CellColour[state];
    context.fill();
  });
}

function getCoordinatesFromIndex(index: number): [x: number, y: number] {
  return [index % sizes.grid.x, Math.floor(index / sizes.grid.x)];
}

const commands: Record<RendererWorkerMessages["operation"], Function> = {
  initiate(
    message: RendererWorkerMessage.Initiate,
    callback: MessagePort["postMessage"],
  ) {
    canvas = message.canvas;

    console.log("Offscreen Canvas initiated");

    // respond to main thread
    callback({ status: "ok" });
  },
  render(
    message: RendererWorkerMessage.Render,
    callback: MessagePort["postMessage"],
  ) {
    const context = canvas.getContext(
      "2d",
    ) as OffscreenCanvasRenderingContext2D;

    renderGridInCanvas(message.state, context);

    // respond to main thread
    callback({ status: "ok" });
  },
};

self.addEventListener("message", (ev: MessageEvent<RendererWorkerMessages>) => {
  // execute one of the commands
  commands[ev.data?.operation]?.(
    ev.data,
    ev.ports?.[0]?.postMessage.bind(ev.ports[0]),
  );
});
