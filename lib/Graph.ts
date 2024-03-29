import type { Settings, LayoutType } from './Settings';
import type { LayoutWorker } from './workers/LayoutWorker';
import { GraphData } from './util/createGraphData';
import { Layout } from './layouts/Layout';
import applyLocks from './util/applyLocks';
import { CanvasWorker, Output } from './workers/CanvasWorker';

declare var Worker: {
  new (scriptURL: 'LayoutWorker.js'): LayoutWorker;
  new (scriptURL: 'CanvasWorker.js'): CanvasWorker;
};

export default class Graph {
  #layoutWorker = new Worker('LayoutWorker.js');
  #canvasWorker = new Worker('CanvasWorker.js');
  #canvas: HTMLCanvasElement;
  #layoutType: LayoutType = 'none';
  #locked = new Map<number, [number, number]>();
  #renderHandler: () => void = () => {};
  #completedRender = true;

  constructor(canvas: HTMLCanvasElement) {
    this.#canvas = canvas;
  }

  onRender(callback: () => void): () => void {
    this.#renderHandler = callback;
    return () => (this.#renderHandler = () => {});
  }

  setData(data: GraphData): void {
    this.#layoutWorker.postMessage(['setData', data]);
    this.#canvasWorker.postMessage(['data', data]);
  }

  setLayout(layoutType: LayoutType): void {
    this.#layoutType = layoutType;
    this.#layoutWorker.postMessage(['setLayout', layoutType]);
  }

  setSettings(settings: Settings): void {
    this.#layoutWorker.postMessage(['setSettings', settings.layouts]);
  }

  getLayoutType(): LayoutType {
    return this.#layoutType;
  }

  runLayout(): void {
    if (!this.#completedRender) return;
    this.#completedRender = false;
    this.#layoutWorker.postMessage(['runLayout', this.#locked]);
  }

  zoom(event: WheelEvent): void {
    const dir = event.deltaY > 0 ? -1 : 1;
    const pt = new DOMPoint(event.offsetX, event.offsetY);
    this.#canvasWorker.postMessage(['zoom', dir, pt]);
  }

  #setLayout(layout: Layout): void {
    applyLocks(layout, this.#locked);
    this.#canvasWorker.postMessage(['layout', layout]);
    this.runLayout();
  }

  #handleCanvasMessage(msg: Output): void {
    switch (msg[0]) {
      case 'locked':
        this.#locked = msg[1];
        break;
      case 'render':
        this.#completedRender = true;
        this.#renderHandler();
        this.runLayout();
    }
  }

  init(): () => void {
    const canvas = this.#canvas;
    const canvasWorker = this.#canvasWorker;

    const offset = canvas.transferControlToOffscreen();
    canvasWorker.postMessage(['canvas', offset], [offset]);

    const onWheel = (event: WheelEvent) => this.zoom(event);
    const onMouseDown = ({ offsetX, offsetY }: MouseEvent) =>
      canvasWorker.postMessage(['mousedown', offsetX, offsetY]);
    const onMouseMove = ({ movementX, movementY }: MouseEvent) =>
      canvasWorker.postMessage(['mousemove', movementX, movementY]);
    const onMouseUp = () => canvasWorker.postMessage(['mouseup']);

    canvas.addEventListener('wheel', onWheel);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);

    this.#layoutWorker.onmessage = (event) => this.#setLayout(event.data);
    this.#canvasWorker.onmessage = (event) => this.#handleCanvasMessage(event.data);

    this.runLayout();

    return () => {
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('mousemove', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      this.#layoutWorker.onmessage = null;
      this.#layoutWorker.terminate();
      this.#canvasWorker.onmessage = null;
      this.#canvasWorker.terminate();
    };
  }
}
