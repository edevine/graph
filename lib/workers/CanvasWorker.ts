import type { Layout } from '../layouts/Layout';
import type { GraphData } from '../util/createGraphData';
import CanvasController from '../render/CanvasController';

type Input =
  | ['canvas', OffscreenCanvas]
  | ['data', GraphData]
  | ['mousedown', number, number]
  | ['mousemove', number, number]
  | ['mouseup']
  | ['layout', Layout]
  | ['zoom', 1 | -1, DOMPoint];

export type Output = ['render'] | ['locked', Map<number, [number, number]>];

export interface CanvasWorker extends Worker {
  postMessage(message: Input, transfer: Transferable[]): void;
  postMessage(message: Input, transfer: OffscreenCanvas[]): void;
  postMessage(message: Input, options?: StructuredSerializeOptions): void;
  onmessage: ((this: CanvasWorker, ev: MessageEvent<Output>) => any) | null;
}

const controller = new CanvasController({
  onlock: (locked) => self.postMessage(['locked', locked]),
  onrender: () => self.postMessage(['render']),
});

const cb = () => {
  controller.draw();
  requestAnimationFrame(cb);
};
requestAnimationFrame(cb);

self.onmessage = ({ data }: MessageEvent<Input>) => {
  switch (data[0]) {
    case 'canvas':
      controller.setContext(data[1].getContext('2d')!);
      break;
    case 'data':
      controller.setData(data[1]);
      break;
    case 'layout':
      controller.setLayout(data[1]);
      break;
    case 'mousedown':
      controller.mouseDown(data[1], data[2]);
      break;
    case 'mousemove':
      controller.mouseMove(data[1], data[2]);
      break;
    case 'mouseup':
      controller.mouseUp();
      break;
    case 'zoom':
      controller.zoom(data[1], data[2]);
  }
};
