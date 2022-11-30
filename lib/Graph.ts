import drawGraph from './render/drawGraph';
import { GraphData } from './util/createGraphData';
import { GraphLayout, Layout } from './layouts/Layout';
import CircularLayout from './layouts/CircularLayout';
import ForceDirectedLayout from './layouts/ForceDirectedLayout';
import NoLayout from './layouts/NoLayout';

export type LayoutType = 'circular' | 'force-directed' | 'none';

const NODE_RADIUS = 10;
const ZOOM_FACTOR = 1.2;
const LEFT_MOUSE_BUTTON = 0;

export default class Graph {
  #canvas: HTMLCanvasElement;
  #context: CanvasRenderingContext2D;
  #layoutType: LayoutType = 'none';
  #layoutPos: Layout | null = null;
  #data: GraphData = { nodes: [], edges: [] };
  #layoutImpl: GraphLayout = new NoLayout();
  #lockedNodes = new Set<number>();

  constructor(canvas: HTMLCanvasElement) {
    this.#canvas = canvas;
    this.#context = canvas.getContext('2d')!;
  }

  setData(data: GraphData): void {
    this.#data = data;
  }

  setLayout(layoutType: LayoutType): void {
    if (layoutType !== this.#layoutType) {
      this.#layoutType = layoutType;
      switch (layoutType) {
        case 'circular':
          this.#layoutImpl = new CircularLayout({ minDistance: 40 }, this.#data);
          break;
        case 'force-directed':
          this.#layoutImpl = new ForceDirectedLayout(this.#data);
          break;
        case 'none':
          this.#layoutImpl = new NoLayout();
          break;
      }
    }
  }

  getLayoutType(): LayoutType {
    return this.#layoutType;
  }

  layout(): void {
    if (this.#layoutPos == null) {
      this.#layoutPos = {
        xAxis: new Float64Array(this.#data.nodes.length),
        yAxis: new Float64Array(this.#data.nodes.length),
      };
    }
    this.#layoutPos = this.#layoutImpl.layout(this.#layoutPos, this.#lockedNodes);
  }

  draw(): void {
    if (this.#layoutPos == null) {
      return;
    }
    drawGraph(this.#context, this.#data, this.#layoutPos);
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
  }

  lockNode(i: number): void {
    this.#lockedNodes.add(i);
  }

  unlockNode(i: number): void {
    this.#lockedNodes.delete(i);
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

  init(): () => void {
    const canvas = this.#canvas;
    let renderHandle = 0;
    let isMouseDown = false;
    let draggedNode: number | null = null;

    const renderCallback = () => {
      this.layout();
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

    return () => {
      cancelAnimationFrame(renderHandle);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('mousemove', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
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
