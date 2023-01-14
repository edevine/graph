import type { GraphData } from '../util/createGraphData';
import MultiMap from '../util/MultiMap';
import { GraphLayout, Layout } from './Layout';

export type CircularLayoutSettings = {
  minDistance: number;
};

export default class CircularLayout implements GraphLayout {
  #initialized = false;
  #startTime = 0;
  #startLayout: Layout | null = null;
  #finalLayout: Layout | null = null;
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
    if (this.#startTime === 0) {
      this.#startTime = Date.now();
    }
    if (this.#finalLayout != null) {
      return this.animate();
    }
    this.#startLayout = {
      xAxis: previousLayout.xAxis.slice(),
      yAxis: previousLayout.yAxis.slice(),
    };

    const { minDistance } = this.#settings;
    const { nodes, edges } = this.#data;
    const edgeMap = new MultiMap();
    for (const [source, target] of edges) {
      edgeMap.add(source, target);
      edgeMap.add(target, source);
    }

    const nodeIndices = new Map<string, number>();
    for (let i = 0; i < nodes.length; i++) {
      nodeIndices.set(nodes[i], i);
    }

    const sorted = [...nodes];
    sorted.sort((a, b) => edgeMap.sizeAt(b) - edgeMap.sizeAt(a));

    const xAxis = new Float64Array(nodes.length);
    const yAxis = new Float64Array(nodes.length);

    const sweep = 2 * Math.PI - (2 * Math.PI) / nodes.length;
    const dTheta = sweep / Math.max(1, nodes.length - 1);

    const dcos = Math.cos(dTheta) - Math.cos(0);
    const dsin = Math.sin(dTheta) - Math.sin(0);
    const radius = Math.sqrt(minDistance ** 2 / (dcos ** 2 + dsin ** 2));

    for (let i = 0; i < sorted.length; i++) {
      if (lockedNodes.has(i)) continue;
      const theta = i * dTheta;
      const j = nodeIndices.get(sorted[i])!;
      xAxis[j] = radius * Math.cos(theta);
      yAxis[j] = radius * Math.sin(theta);
    }
    this.#finalLayout = { xAxis, yAxis };
    return previousLayout;
  }

  animate(): Layout {
    const time = Date.now() - this.#startTime;
    if (time >= 500) {
      this.#initialized = true;
      return this.#finalLayout!;
    }
    const final = this.#finalLayout!;
    const start = this.#startLayout!;
    const length = final.xAxis.length;
    const xAxis = new Float64Array(length);
    const yAxis = new Float64Array(length);
    const progress = time / 1000;
    for (let i = 0; i < length; i++) {
      xAxis[i] = start.xAxis[i] + (final.xAxis[i] - start.xAxis[i]) * progress;
      yAxis[i] = start.yAxis[i] + (final.yAxis[i] - start.yAxis[i]) * progress;
    }
    this.#finalLayout = null;
    this.#startLayout = null;
    return { xAxis, yAxis };
  }

  setSettings(settings: CircularLayoutSettings): void {
    this.#initialized = false;
    this.#settings = settings;
  }
}
