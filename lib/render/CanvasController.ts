import { Layout } from '../layouts/Layout';
import { GraphData } from '../util/createGraphData';
import drawGraph from './drawGraph';

const NODE_RADIUS = 10;
const ZOOM_FACTOR = 1.2;

type Callbacks = { onlock: (locked: Map<number, [number, number]>) => void; onrender: () => void };

export default class CanvasController {
  #context: OffscreenCanvasRenderingContext2D;
  #layout: Layout = { xAxis: new Float64Array(), yAxis: new Float64Array() };
  #data: GraphData = { nodes: [], edges: [] };
  #draggedNode: number | null = null;
  #locked = new Map<number, [number, number]>();
  #mouseDown = false;
  #cb: Callbacks;
  #needsDraw = true;

  constructor(cb: Callbacks) {
    const canvas = new OffscreenCanvas(300, 150);
    this.#context = canvas.getContext('2d')!;
    this.#cb = cb;
  }

  draw(): void {
    if (!this.#needsDraw) return;
    this.#needsDraw = false;
    drawGraph(this.#context, this.#data, this.#layout);
    this.#cb.onrender();
  }

  setContext(context: OffscreenCanvasRenderingContext2D): void {
    this.#needsDraw = true;
    this.#context = context;
  }

  setData(data: GraphData): void {
    this.#needsDraw = true;
    this.#data = data;
  }

  setLayout(layout: Layout): void {
    this.#needsDraw = true;
    this.#layout = layout;
  }

  mouseDown(x: number, y: number): void {
    this.#mouseDown = true;
    const i = this.#getNodeIndexAt(x, y);
    if (!i) return;
    this.#needsDraw = true;
    this.#draggedNode = i;
    this.#locked.set(i, [this.#layout.xAxis[i], this.#layout.yAxis[i]]);
    this.#cb.onlock(this.#locked);
  }

  mouseMove(x: number, y: number): void {
    if (!this.#mouseDown) return;
    this.#needsDraw = true;
    const d = this.scalePoint(x, y);
    if (this.#draggedNode) {
      const i = this.#draggedNode;
      this.#layout.xAxis[i] += d.x;
      this.#layout.yAxis[i] += d.y;
      this.#locked.set(i, [this.#layout.xAxis[i], this.#layout.yAxis[i]]);
      this.#cb.onlock(this.#locked);
    } else {
      this.#context.translate(d.x, d.y);
    }
  }

  mouseUp(): void {
    this.#mouseDown = false;
    if (!this.#draggedNode) return;
    this.#needsDraw = true;
    this.#locked.delete(this.#draggedNode);
    this.#cb.onlock(this.#locked);
    this.#draggedNode = null;
  }

  zoom(dir: 1 | -1, pt: DOMPoint): void {
    this.#needsDraw = true;
    const factor = ZOOM_FACTOR ** dir;
    const { x, y } = this.transformPoint(pt);
    this.#context.translate(x, y);
    this.#context.scale(factor, factor);
    this.#context.translate(-x, -y);
  }

  #getNodeIndexAt(x: number, y: number): number | null {
    const context = this.#context;
    const nodes = this.#data.nodes;
    const { xAxis, yAxis } = this.#layout;
    for (let i = 0; i < nodes.length; i++) {
      const path = new Path2D();
      path.arc(xAxis[i], yAxis[i], NODE_RADIUS, 0, 360);
      if (context.isPointInPath(path, x, y)) return i;
    }
    return null;
  }

  scalePoint(x: number, y: number): DOMPoint {
    const matrix = this.#context.getTransform().invertSelf();
    return new DOMPoint(x * matrix.a, y * matrix.d);
  }

  /** Transform screen space to world space */
  transformPoint(pt: DOMPoint): DOMPoint {
    return this.#context.getTransform().invertSelf().transformPoint(pt);
  }
}
