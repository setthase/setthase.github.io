// define sizes of things used in the app
export const sizes = {
  grid: { x: 36, y: 36 },
  cell: { width: 10, height: 10 },

  // to be calculated later
  canvas: { width: 0, height: 0 },
};

// Calculate size of the canvas element
sizes.canvas = {
  width: sizes.grid.x * sizes.cell.width * 2,
  height: sizes.grid.y * sizes.cell.height * 2,
};

// use constants to refer to cell state
export enum CellState {
  DEAD = 0,
  ALIVE = 1,
}
