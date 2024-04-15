import { Layout } from '../layouts/Layout';
import { GraphData } from '../util/createGraphData';

const NODE_RADIUS = 10;

export default function drawGraph(
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  { nodes, edges }: GraphData,
  [xAxis, yAxis]: Layout,
): void {
  // build Map { ID -> index } to look up coordinates in constant time
  const nodeIndices = new Map();
  for (let i = 0; i < nodes.length; i++) {
    nodeIndices.set(nodes[i], i);
  }

  context.save();
  context.resetTransform();
  context.fillStyle = 'white';
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  context.restore();
  context.fillStyle = 'black';

  for (const [sourceID, targetID] of edges) {
    context.beginPath();
    const sourceIndex = nodeIndices.get(sourceID);
    const targetIndex = nodeIndices.get(targetID);
    context.moveTo(xAxis[sourceIndex], yAxis[sourceIndex]);
    context.lineTo(xAxis[targetIndex], yAxis[targetIndex]);
    context.stroke();
  }

  for (let i = 0; i < nodes.length; i++) {
    context.beginPath();
    const node = nodes[i];
    context.arc(xAxis[i], yAxis[i], NODE_RADIUS, 0, 360);
    context.fill();
    context.stroke();
  }
  context.restore();
}
