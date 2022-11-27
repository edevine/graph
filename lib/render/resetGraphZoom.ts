export default function resetGraphZoom(
  context: CanvasRenderingContext2D,
  rect: DOMRect,
  gutter: number,
): void {
  // Zoom so the entire graph fits within the viewport
  const canvas = context.canvas;
  const hSacle = (canvas.width - gutter * 2) / rect.width;
  const vSacle = (canvas.height - gutter * 2) / rect.height;
  const scale = Math.min(1, hSacle, vSacle);

  // Shift the coordinates so the graph is centered:
  const translateX = canvas.width / scale / 2 - (rect.x + rect.width / 2) + gutter;
  const translateY = canvas.height / scale / 2 - (rect.y + rect.height / 2) + gutter;

  context.resetTransform();
  context.translate(0.5, 0.5);
  context.scale(scale, scale);
  context.translate(translateX, translateY);
}
