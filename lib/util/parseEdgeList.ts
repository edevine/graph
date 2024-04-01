import { GraphData } from './createGraphData';

export default function parseEdgeList(list: string): GraphData {
  const nodes = new Set<string>();
  const edges = list.split('\n').map((ln) => ln.split(' ') as [string, string]);
  for (const edge of edges) {
    nodes.add(edge[0]).add(edge[1]);
  }
  return { nodes: Array.from(nodes), edges };
}
