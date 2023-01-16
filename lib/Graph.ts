import type { Settings, LayoutType } from './Settings';
import type { LayoutWorker } from './workers/LayoutWorker';
import drawGraph from './render/drawGraph';
import { GraphData } from './util/createGraphData';
import { Layout } from './layouts/Layout';
import applyLocks from './util/applyLocks';

const NODE_RADIUS = 10;
const ZOOM_FACTOR = 1.2;
const LEFT_MOUSE_BUTTON = 0;

declare var Worker: {
  new (scriptURL: 'LayoutWorker.js'): LayoutWorker;
};

export default class Graph {
  #layoutWorker = new Worker('LayoutWorker.js');
  #canvas: HTMLCanvasElement;
  #context: CanvasRenderingContext2D;
  #layoutType: LayoutType = 'none';
  #layoutPos: Layout | null = null;
  #data: GraphData = { nodes: [], edges: [] };
  #locked = new Map<number, [number, number]>();
  #renderHandler: () => void = () => {};
  #completedRender = true;

  constructor(canvas: HTMLCanvasElement) {
    this.#canvas = canvas;
    this.#context = canvas.getContext('2d')!;
  }

  onRender(callback: () => void): () => void {
    this.#renderHandler = callback;
    return () => (this.#renderHandler = () => {});
  }

  setData(data: GraphData): void {
    this.#data = data;
    this.#layoutWorker.postMessage(['setData', data]);
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

  draw(): void {
    if (this.#layoutPos == null) {
      return;
    }
    this.runLayout();
    drawGraph(this.#context, this.#data, this.#layoutPos);
    this.#completedRender = true;
    this.#renderHandler();
  }

  pan(event: MouseEvent): void {
    const delta = this.movementToDelta(event);
    this.#context.translate(delta.x, delta.y);
  }

  moveNode(i: number, event: MouseEvent): void {
    if (this.#layoutPos == null) return;
    const delta = this.movementToDelta(event);
    this.#layoutPos.xAxis[i] += delta.x;
    this.#layoutPos.yAxis[i] += delta.y;
    const locked = this.#locked.get(i);
    if (locked != null) {
      locked[0] = this.#layoutPos.xAxis[i];
      locked[1] = this.#layoutPos.yAxis[i];
    }
  }

  lockNode(i: number): void {
    if (this.#layoutPos == null) return;
    this.#locked.set(i, [this.#layoutPos.xAxis[i], this.#layoutPos.yAxis[i]]);
  }

  unlockNode(i: number): void {
    this.#locked.delete(i);
  }

  zoomAt(event: WheelEvent): void {
    const dir = event.deltaY > 0 ? -1 : 1;
    const factor = ZOOM_FACTOR ** dir;
    const { x, y } = this.offsetToCoord(event);
    this.#context.translate(x, y);
    this.#context.scale(factor, factor);
    this.#context.translate(-x, -y);
  }

  getNodeIndexAt(event: MouseEvent): number | null {
    if (this.#layoutPos == null) return null;
    const context = this.#context;
    const nodes = this.#data.nodes;
    const { xAxis, yAxis } = this.#layoutPos;
    const { offsetX, offsetY } = event;
    for (let i = 0; i < nodes.length; i++) {
      const path = new Path2D();
      path.arc(xAxis[i], yAxis[i], NODE_RADIUS, 0, 360);
      if (context.isPointInPath(path, offsetX, offsetY)) return i;
    }
    return null;
  }

  #setLayout(layout: Layout): void {
    applyLocks(layout, this.#locked);
    this.#layoutPos = layout;
    this.runLayout();
  }

  init(): () => void {
    const canvas = this.#canvas;
    let renderHandle = 0;
    let isMouseDown = false;
    let draggedNode: number | null = null;

    const renderCallback = () => {
      this.draw();
      renderHandle = requestAnimationFrame(renderCallback);
    };
    renderHandle = requestAnimationFrame(renderCallback);

    const onWheel = (event: WheelEvent) => {
      this.zoomAt(event);
    };

    const onMouseDown = (event: MouseEvent) => {
      if (event.button === LEFT_MOUSE_BUTTON) {
        isMouseDown = true;
        draggedNode = this.getNodeIndexAt(event);
        if (draggedNode != null) this.lockNode(draggedNode);
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (isMouseDown) {
        if (draggedNode == null) this.pan(event);
        else this.moveNode(draggedNode, event);
      }
    };

    const onMouseUp = (event: MouseEvent) => {
      if (event.button === LEFT_MOUSE_BUTTON) {
        isMouseDown = false;
        if (draggedNode != null) this.unlockNode(draggedNode);
        draggedNode = null;
      }
    };

    canvas.addEventListener('wheel', onWheel);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    this.#layoutWorker.onmessage = (event) => this.#setLayout(event.data);

    this.runLayout();

    return () => {
      cancelAnimationFrame(renderHandle);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('mousemove', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      this.#layoutWorker.onmessage = null;
      this.#layoutWorker.terminate();
    };
  }

  private movementToDelta(event: MouseEvent): DOMPoint {
    const matrix = this.#context.getTransform().invertSelf();
    return new DOMPoint(event.movementX * matrix.a, event.movementY * matrix.d);
  }

  private offsetToCoord(event: MouseEvent): DOMPoint {
    const pt = new DOMPoint(event.offsetX, event.offsetY);
    return this.transformPoint(pt);
  }

  /** Transform screen space to world space */
  private transformPoint(pt: DOMPoint): DOMPoint {
    return this.#context.getTransform().invertSelf().transformPoint(pt);
  }
}
