const ZOOM_FACTOR = 1.2;
const LEFT_MOUSE_BUTTON = 0;

export default class Graph {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d')!;
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
    let isMouseDown = false;

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
