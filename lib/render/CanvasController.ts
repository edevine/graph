import { Layout } from '../layouts/Layout';
import { GraphData } from '../util/createGraphData';
import drawGraph from './drawGraph';

const NODE_RADIUS = 10;
const ZOOM_FACTOR = 1.2;

type Callbacks = { onlock: (locked: Map<number, [number, number]>) => void; onrender: () => void };

export default class CanvasController {
  #context: OffscreenCanvasRenderingContext2D;
  #layout: Layout = [new Float64Array(), new Float64Array()];
  #data: GraphData = { nodes: [], edges: [] };
  #nodeIndices = new Map<string, number>();
  #dragging = false;
  #cb: Callbacks;
  #needsDraw = true;
  #hasNewLayout = false;
  #lasso: DOMRect | null = null;
  #movingNodes = new Map<number, [number, number]>();
  #selectedNodes = new Set<number>();

  constructor(cb: Callbacks) {
    const canvas = new OffscreenCanvas(300, 150);
    this.#context = canvas.getContext('2d')!;
    this.#cb = cb;
  }

  draw(): void {
    if (!this.#needsDraw) return;
    this.#needsDraw = false;
    drawGraph(
      this.#context,
      this.#data,
      this.#nodeIndices,
      this.#layout,
      this.#lasso,
      this.#selectedNodes,
    );
    if (this.#hasNewLayout) {
      this.#hasNewLayout = false;
      this.#cb.onrender();
    }
  }

  setContext(context: OffscreenCanvasRenderingContext2D): void {
    this.#needsDraw = true;
    this.#context = context;
  }

  setData(data: GraphData): void {
    this.#needsDraw = true;
    this.#data = data;
    const nodes = data.nodes;
    this.#nodeIndices.clear();
    // build Map { ID -> index } to look up coordinates in constant time
    for (let i = 0; i < nodes.length; i++) {
      this.#nodeIndices.set(nodes[i], i);
    }
  }

  setLayout(layout: Layout): void {
    this.#needsDraw = true;
    this.#hasNewLayout = true;
    this.#layout = layout;
  }

  mouseDown(offsetX: number, offsetY: number, lasso: boolean): void {
    if (lasso) {
      this.#lasso = new DOMRect(offsetX, offsetY);
    } else {
      this.#dragging = true;
      const i = this.#getNodeIndexAt(offsetX, offsetY);
      if (i == null) return;
      if (!this.#selectedNodes.has(i)) {
        this.#selectedNodes.clear();
        this.#selectedNodes.add(i);
      }
      for (const i of this.#selectedNodes) {
        this.#movingNodes.set(i, [this.#layout[0][i], this.#layout[1][i]]);
      }
      this.#needsDraw = true;
      this.#cb.onlock(this.#movingNodes);
    }
  }

  mouseMove(offsetX: number, offsetY: number, movementX: number, movementY: number): void {
    if (this.#lasso) {
      this.#needsDraw = true;
      this.#lasso.width = offsetX - this.#lasso.x;
      this.#lasso.height = offsetY - this.#lasso.y;
    }
    if (this.#dragging) {
      this.#needsDraw = true;
      const d = this.scalePoint(movementX, movementY);
      if (this.#movingNodes.size > 0) {
        for (const i of this.#movingNodes.keys()) {
          this.#layout[0][i] += d.x;
          this.#layout[1][i] += d.y;
          this.#movingNodes.set(i, [this.#layout[0][i], this.#layout[1][i]]);
        }
        this.#cb.onlock(this.#movingNodes);
      } else {
        this.#context.translate(d.x, d.y);
      }
    }
  }

  mouseUp(): void {
    if (this.#lasso != null) {
      this.#setSelectedNodes();
      this.#lasso = null;
      this.#needsDraw = true;
    }
    this.#dragging = false;
    if (this.#selectedNodes.size > 0) {
      this.#needsDraw = true;
      this.#movingNodes.clear();
      this.#cb.onlock(this.#movingNodes);
    }
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
    const [xAxis, yAxis] = this.#layout;
    for (let i = 0; i < nodes.length; i++) {
      const path = new Path2D();
      path.arc(xAxis[i], yAxis[i], NODE_RADIUS, 0, 360);
      if (context.isPointInPath(path, x, y)) return i;
    }
    return null;
  }

  #setSelectedNodes(): void {
    if (this.#lasso == null) {
      return;
    }
    this.#selectedNodes.clear();
    const { x, y, width, height } = this.#lasso;
    const nodes = this.#data.nodes;
    const [xAxis, yAxis] = this.#layout;
    const pt1 = this.transformPoint(new DOMPoint(x, y));
    const pt2 = this.transformPoint(new DOMPoint(x + width, y + height));
    for (let i = 0; i < nodes.length; i++) {
      const x = xAxis[i];
      const y = yAxis[i];
      if (
        ((x >= pt1.x && x <= pt2.x) || (x <= pt1.x && x >= pt2.x)) &&
        ((y >= pt1.y && y <= pt2.y) || (y <= pt1.y && y >= pt2.y))
      ) {
        this.#selectedNodes.add(i);
      }
    }
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
