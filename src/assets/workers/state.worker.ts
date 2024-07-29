/// <reference lib="webworker" />

import { CellState, sizes } from "../shared/configuration.js";
import type {
  StateWorkerMessage,
  StateWorkerMessages,
} from "../types/worker.js";

// instantiate cells list
let cells: Uint8Array;

// Note: inspired by https://medium.com/@mattkenefick/conways-game-of-life-in-javascript-6d3811626464
function countLivingNeighbours(index = 0): number {
  const { x, y } = sizes.grid;

  const above = Math.max(0, Math.floor((index - x) / x));
  const current = Math.floor(index / x);
  const below = Math.min(y - 1, Math.floor((index + x) / x));

  const neighbours = {
    [above * x + Math.abs(parseInt(((index % x) - 1).toString(36), x))]: 1,
    [above * x + parseInt(((index % x) - 0).toString(36), x)]: 1,
    [above * x + Math.min(x, parseInt(((index % x) + 1).toString(36), x))]: 1,

    [current * x + Math.abs(parseInt(((index % x) - 1).toString(36), x))]: 1,
    [current * x + Math.min(x, parseInt(((index % x) + 1).toString(36), x))]: 1,

    [below * x + Math.abs(parseInt(((index % x) - 1).toString(36), x))]: 1,
    [below * x + parseInt(((index % x) - 0).toString(36), x)]: 1,
    [below * x + Math.min(x, parseInt(((index % x) + 1).toString(36), x))]: 1,
  };

  return Object.keys(neighbours).filter((key) => {
    const neighbourIndex = parseInt(key, 10);

    return (
      neighbourIndex >= 0 &&
      neighbourIndex != index &&
      cells[neighbourIndex] === CellState.ALIVE
    );
  }).length;
}

function calculateNextGeneration() {
  return cells.map((state, index) => {
    const neighbours = countLivingNeighbours(index);

    return state === CellState.ALIVE && [2, 3].includes(neighbours)
      ? CellState.ALIVE
      : state === CellState.DEAD && neighbours === 3
        ? CellState.ALIVE
        : CellState.DEAD;
  });
}

function randomisePopulation(saturation = 0.7) {
  cells = Uint8Array.from({ length: sizes.grid.x * sizes.grid.y }, () =>
    Math.random() > saturation ? CellState.ALIVE : CellState.DEAD,
  );
}

const commands: Record<StateWorkerMessages["operation"], Function> = {
  initiate(
    message: StateWorkerMessage.Initiate,
    callback: MessagePort["postMessage"],
  ) {
    randomisePopulation(0.5);

    console.log("State initiated");

    // respond to main thread
    callback({ status: "ok" });
  },
  next(message: StateWorkerMessage.Next, callback: MessagePort["postMessage"]) {
    const nextState = calculateNextGeneration();

    // respond to main thread
    callback({ status: "ok", state: nextState });

    cells = nextState;
  },
};

self.addEventListener("message", (ev: MessageEvent<StateWorkerMessages>) => {
  // execute one of the commands
  commands[ev.data?.operation]?.(
    ev.data,
    ev.ports?.[0]?.postMessage.bind(ev.ports[0]),
  );
});
