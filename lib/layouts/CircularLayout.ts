import type { GraphData } from '../util/createGraphData';
import MultiMap from '../util/MultiMap';
import { GraphLayout, Layout } from './Layout';
import transitionLayout from './transitionLayout';

export type CircularLayoutSettings = {
  minDistance: number;
};

export default class CircularLayout implements GraphLayout {
  #settings: CircularLayoutSettings;
  #data: GraphData;
  #transition: Iterator<Layout, Layout> | null = null;
  #finished = false;

  constructor(settings: CircularLayoutSettings, data: GraphData) {
    this.#settings = settings;
    this.#data = data;
  }

  layout(previousLayout: Layout): Layout {
    if (this.#finished) {
      return previousLayout;
    }
    if (this.#transition != null) {
      const result = this.#transition.next();
      if (result.done) {
        this.#finished = true;
        this.#transition = null;
      }
      return result.value;
    }
    const layout = computeCircularLayout(this.#settings, this.#data);

    this.#transition = transitionLayout(previousLayout, layout, 500);
    return previousLayout;
  }

  setSettings(settings: CircularLayoutSettings): void {
    this.#settings = settings;
  }
}

function computeCircularLayout(
  { minDistance }: CircularLayoutSettings,
  { nodes, edges }: GraphData,
): Layout {
  const edgeMap = new MultiMap();
  for (const [source, target] of edges) {
    edgeMap.add(source, target);
    edgeMap.add(target, source);
  }

  const nodeIndices = new Map<string, number>();
  for (let i = 0; i < nodes.length; i++) {
    nodeIndices.set(nodes[i], i);
  }

  const sorted = nodes.slice();
  sorted.sort((a, b) => edgeMap.sizeAt(b) - edgeMap.sizeAt(a));

  const xAxis = new Float64Array(nodes.length);
  const yAxis = new Float64Array(nodes.length);

  const sweep = 2 * Math.PI - (2 * Math.PI) / nodes.length;
  const dTheta = sweep / Math.max(1, nodes.length - 1);

  const dcos = Math.cos(dTheta) - Math.cos(0);
  const dsin = Math.sin(dTheta) - Math.sin(0);
  const radius = Math.sqrt(minDistance ** 2 / (dcos ** 2 + dsin ** 2));

  for (let i = 0; i < sorted.length; i++) {
    const theta = i * dTheta;
    const j = nodeIndices.get(sorted[i])!;
    xAxis[j] = radius * Math.cos(theta);
    yAxis[j] = radius * Math.sin(theta);
  }

  return [xAxis, yAxis];
}
