import type { GraphData } from '../util/createGraphData';
import { GraphLayout, Layout } from './Layout';

const GRAVITY = -0.02;
const FORCE = 100;

export default class ForceDirectedLayout implements GraphLayout {
  constructor(private data: GraphData) {}

  layout({ xAxis, yAxis }: Layout): Layout {
    const { nodes, edges } = this.data;
    const nodeIndices = new Map();
    for (let i = 0; i < nodes.length; i++) {
      nodeIndices.set(nodes[i], i);
    }

    const xForces = new Float64Array(nodes.length);
    const yForces = new Float64Array(nodes.length);

    // apply force towards center
    for (let i = 0; i < nodes.length; i++) {
      xForces[i] = xAxis[i] * GRAVITY;
      yForces[i] = yAxis[i] * GRAVITY;
    }

    // apply repulsive force between nodes
    // force is inversely proportional to squared distance
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        let dx = xAxis[j] - xAxis[i];
        let dy = yAxis[j] - yAxis[i];
        if (dx === 0) dx = Math.random();
        if (dy === 0) dy = Math.random();

        const forceX = (dx / dx ** 2) * FORCE;
        const forceY = (dy / dy ** 2) * FORCE;

        xForces[i] -= forceX;
        yForces[i] -= forceY;
        xForces[j] += forceX;
        yForces[j] += forceY;
      }
    }

    // apply attractive forces from edges
    for (const edge of edges) {
      const s = nodeIndices.get(edge[0]);
      const t = nodeIndices.get(edge[1]);
      const dx = (xAxis[s] - xAxis[t]) / 2;
      const dy = (yAxis[s] - yAxis[t]) / 2;
      xForces[s] -= dx;
      yForces[s] -= dy;
      xForces[t] += dx;
      yForces[t] += dy;
    }

    for (let i = 0; i < xForces.length; i++) {
      const x = xForces[i];
      const y = yForces[i];
      if (x > 0.5 || x < -0.5) xAxis[i] += x / 10;
      if (y > 0.5 || y < -0.5) yAxis[i] += y / 10;
    }

    return { xAxis, yAxis };
  }
}
