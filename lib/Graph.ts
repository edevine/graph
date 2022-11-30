import drawGraph from './render/drawGraph';
import { GraphData } from './util/createGraphData';
import { GraphLayout, Layout } from './layouts/Layout';
import CircularLayout from './layouts/CircularLayout';
import ForceDirectedLayout from './layouts/ForceDirectedLayout';
import NoLayout from './layouts/NoLayout';

export type LayoutType = 'circular' | 'force-directed' | 'none';

const ZOOM_FACTOR = 1.2;
const LEFT_MOUSE_BUTTON = 0;

const iterativeLayouts = new Set<LayoutType>(['force-directed']);

export default class Graph {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private layoutType: LayoutType = 'none';
  private layoutPos: Layout | null = null;
  private data: GraphData = { nodes: [], edges: [] };
  private layoutImpl: GraphLayout = new NoLayout();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d')!;
  }

  setData(data: GraphData): void {
    this.data = data;
  }

  setLayout(layoutType: LayoutType): void {
    if (layoutType !== this.layoutType) {
      this.layoutType = layoutType;
      switch (layoutType) {
        case 'circular':
          this.layoutImpl = new CircularLayout({ minDistance: 40 }, this.data);
          break;
        case 'force-directed':
          this.layoutImpl = new ForceDirectedLayout(this.data);
          break;
        case 'none':
          this.layoutImpl = new NoLayout();
          break;
      }
    }
  }

  layout(): void {
    if (this.layoutPos == null) {
      this.layoutPos = {
        xAxis: new Float64Array(this.data.nodes.length),
        yAxis: new Float64Array(this.data.nodes.length),
      };
    }
    this.layoutPos = this.layoutImpl.layout(this.layoutPos);
  }

  draw(): void {
    if (this.layoutPos == null) {
      return;
    }
    drawGraph(this.context, this.data, this.layoutPos);
  }

  pan(event: MouseEvent): void {
    const delta = this.movementToDelta(event);
    this.context.translate(delta.x, delta.y);
  }

  zoomAt(event: WheelEvent): void {
    const dir = event.deltaY > 0 ? -1 : 1;
    const factor = ZOOM_FACTOR ** dir;
    const { x, y } = this.offsetToCoord(event);
    this.context.translate(x, y);
    this.context.scale(factor, factor);
    this.context.translate(-x, -y);
  }

  init(): () => void {
    const canvas = this.canvas;
    let renderHandle = 0;
    let isMouseDown = false;

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
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (isMouseDown) {
        this.pan(event);
      }
    };

    const onMouseUp = (event: MouseEvent) => {
      if (event.button === LEFT_MOUSE_BUTTON) {
        isMouseDown = false;
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
    const matrix = this.context.getTransform().invertSelf();
    return new DOMPoint(event.movementX * matrix.a, event.movementY * matrix.d);
  }

  private offsetToCoord(event: MouseEvent): DOMPoint {
    const pt = new DOMPoint(event.offsetX, event.offsetY);
    return this.transformPoint(pt);
  }

  /** Transform screen space to world space */
  private transformPoint(pt: DOMPoint): DOMPoint {
    return this.context.getTransform().invertSelf().transformPoint(pt);
  }
}
