import { CellState } from "../shared/configuration";

interface Message {
  operation: string;
}

////////////////////////////////////

export namespace StateWorkerMessage {
  export interface Initiate extends Message {
    operation: "initiate";
  }

  export interface Next extends Message {
    operation: "next";
  }
}

export type StateWorkerMessages =
  | StateWorkerMessage.Initiate
  | StateWorkerMessage.Next;

////////////////////////////////////

export namespace RendererWorkerMessage {
  export interface Initiate extends Message {
    operation: "initiate";
    canvas: OffscreenCanvas;
  }

  export interface Render extends Message {
    operation: "render";
    state: CellState[];
  }
}

export type RendererWorkerMessages =
  | RendererWorkerMessage.Initiate
  | RendererWorkerMessage.Render;
