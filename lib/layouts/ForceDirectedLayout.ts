import type { GraphData } from '../util/createGraphData';
import { GraphLayout, Layout } from './Layout';

type ForceDirectedLayoutSettings = {
  gravity: number;
  force: number;
  velocity: number;
};

export default class ForceDirectedLayout implements GraphLayout {
  #data: GraphData;
  #settings: ForceDirectedLayoutSettings;

  constructor(settings: ForceDirectedLayoutSettings, data: GraphData) {
    this.#settings = settings;
    this.#data = data;
  }

  layout({ xAxis, yAxis }: Layout, lockedNodes: Set<number>): Layout {
    const GRAVITY = this.#settings.gravity * -1;
    const FORCE = this.#settings.force;
    const VELOCITY = this.#settings.velocity;
    const { nodes, edges } = this.#data;
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
      if (lockedNodes.has(i)) continue;
      const x = xForces[i];
      const y = yForces[i];
      if (x > 0.5 || x < -0.5) xAxis[i] += x * VELOCITY;
      if (y > 0.5 || y < -0.5) yAxis[i] += y * VELOCITY;
    }

    return { xAxis, yAxis };
  }

  setSettings(settings: ForceDirectedLayoutSettings): void {
    this.#settings = settings;
  }
}
