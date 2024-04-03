import type { GraphData } from '../util/createGraphData';
import { GraphLayout, Layout } from './Layout';

type ForceDirectedLayoutSettings = {
  gravity: number;
  force: number;
};

export default class ForceDirectedLayout implements GraphLayout {
  #data: GraphData;
  #settings: ForceDirectedLayoutSettings;
  #nodeIndices: Map<string, number>;
  #connectivity: Int16Array;

  constructor(settings: ForceDirectedLayoutSettings, data: GraphData) {
    this.#settings = settings;
    this.#data = data;
    const { nodes, edges } = data;

    const nodeIndices = new Map<string, number>();
    for (let i = 0; i < nodes.length; i++) {
      nodeIndices.set(nodes[i], i);
    }

    const connectivity = new Int16Array(nodes.length);
    for (const edge of edges) {
      const s = nodeIndices.get(edge[0])!;
      const t = nodeIndices.get(edge[1])!;
      connectivity[s]++;
      connectivity[t]++;
    }

    this.#nodeIndices = nodeIndices;
    this.#connectivity = connectivity;
  }

  layout({ xAxis, yAxis }: Layout): Layout {
    const GRAVITY = this.#settings.gravity * -1;
    const FORCE = this.#settings.force;
    const { nodes, edges } = this.#data;
    const nodeIndices = this.#nodeIndices;
    const xForces = new Float64Array(nodes.length);
    const yForces = new Float64Array(nodes.length);
    const connectivity = this.#connectivity;

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
        if (dx === 0 && dy === 0) {
          dx = Math.random() - 0.5;
          dy = Math.random() - 0.5;
        }
        const d = (dx ** 2 + dy ** 2) ** 0.5;

        const force = (d / d ** 2) * FORCE;
        const forceX = (dx / d) * force;
        const forceY = (dy / d) * force;

        xForces[i] -= forceX;
        yForces[i] -= forceY;
        xForces[j] += forceX;
        yForces[j] += forceY;
      }
    }

    // apply attractive forces from edges
    for (const edge of edges) {
      const s = nodeIndices.get(edge[0])!;
      const t = nodeIndices.get(edge[1])!;
      const dx = (xAxis[s] - xAxis[t]) / 2;
      const dy = (yAxis[s] - yAxis[t]) / 2;
      xForces[s] -= dx;
      yForces[s] -= dy;
      xForces[t] += dx;
      yForces[t] += dy;
    }

    for (let i = 0; i < nodes.length; i++) {
      // velocity must be inversely proportional to node connectivity
      // to prevent nodes flying off
      const conn = connectivity[i];
      const velocity = 1 - conn / (conn + 1);
      const x = xForces[i] * velocity;
      const y = yForces[i] * velocity;
      if (x > 0.5 || x < -0.5) xAxis[i] += x;
      if (y > 0.5 || y < -0.5) yAxis[i] += y;
    }

    return { xAxis, yAxis };
  }

  setSettings(settings: ForceDirectedLayoutSettings): void {
    this.#settings = settings;
  }
}
