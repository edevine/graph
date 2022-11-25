import type { GraphData } from '../util/createGraphData';
import { Layout } from './Layout';

export type CircularLayoutConfig = {
  minDistance: number;
};

export default function circularLayout(
  { nodes }: GraphData,
  { minDistance }: CircularLayoutConfig,
): Layout {
  const xAxis = new Float64Array(nodes.length);
  const yAxis = new Float64Array(nodes.length);

  const sweep = 2 * Math.PI - (2 * Math.PI) / nodes.length;
  const dTheta = sweep / Math.max(1, nodes.length - 1);

  const dcos = Math.cos(dTheta) - Math.cos(0);
  const dsin = Math.sin(dTheta) - Math.sin(0);
  const radius = Math.sqrt(minDistance ** 2 / (dcos ** 2 + dsin ** 2));

  for (let i = 0; i < nodes.length; i++) {
    const theta = i * dTheta;
    xAxis[i] = radius * Math.cos(theta);
    yAxis[i] = radius * Math.sin(theta);
  }
  return { xAxis, yAxis };
}
