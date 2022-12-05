import type { GraphData } from '../util/createGraphData';
import MultiMap from '../util/MultiMap';
import { GraphLayout, Layout } from './Layout';

export type CircularLayoutSettings = {
  minDistance: number;
};

export default class CircularLayout implements GraphLayout {
  #initialized = false;
  #settings: CircularLayoutSettings;
  #data: GraphData;

  constructor(settings: CircularLayoutSettings, data: GraphData) {
    this.#settings = settings;
    this.#data = data;
  }

  layout(previousLayout: Layout, lockedNodes: Set<number>): Layout {
    if (this.#initialized) {
      return previousLayout;
    }
    this.#initialized = true;

    const { minDistance } = this.#settings;
    const { nodes, edges } = this.#data;
    const edgeMap = new MultiMap();
    for (const [source, target] of edges) {
      edgeMap.add(source, target);
      edgeMap.add(target, source);
    }

    nodes.sort((a, b) => edgeMap.sizeAt(b) - edgeMap.sizeAt(a));

    const xAxis = new Float64Array(nodes.length);
    const yAxis = new Float64Array(nodes.length);

    const sweep = 2 * Math.PI - (2 * Math.PI) / nodes.length;
    const dTheta = sweep / Math.max(1, nodes.length - 1);

    const dcos = Math.cos(dTheta) - Math.cos(0);
    const dsin = Math.sin(dTheta) - Math.sin(0);
    const radius = Math.sqrt(minDistance ** 2 / (dcos ** 2 + dsin ** 2));

    for (let i = 0; i < nodes.length; i++) {
      if (lockedNodes.has(i)) continue;
      const theta = i * dTheta;
      xAxis[i] = radius * Math.cos(theta);
      yAxis[i] = radius * Math.sin(theta);
    }
    return { xAxis, yAxis };
  }

  setSettings(settings: CircularLayoutSettings): void {
    this.#initialized = false;
    this.#settings = settings;
  }
}
