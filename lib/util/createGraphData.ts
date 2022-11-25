import boxMuller from './boxMuller';

export type GraphData = {
  nodes: string[];
  edges: [string, string][];
};

/**
 * Generates a random network via Box-Muller algorithm.
 * @param nodeCount The number of nodes in the netwerk
 * @param meanEdges The mean outgoing edges of each node.
 * @param edgeDeviation The standard deviation of edge distribution.
 * @returns a network node and edge list.
 */
export default function createGraphData(
  nodeCount: number,
  meanEdges: number,
  edgeDeviation: number,
): GraphData {
  const maxEdges = nodeCount - 1;
  if (meanEdges >= maxEdges) {
    throw new Error('Mean edge count must be less than node count.');
  }
  const getEdgeCount = boxMuller(meanEdges, edgeDeviation);
  const nodes: string[] = new Array(nodeCount);
  const edges: [string, string][] = [];
  for (let i = 0; i < nodeCount; i++) {
    nodes[i] = 'node_' + String(i);
  }
  for (let i = 0; i < nodeCount; i++) {
    const sourceID = nodes[i];
    const edgeCount = Math.max(Math.round(getEdgeCount()), maxEdges);
    const ids = new Set();
    while (ids.size < edgeCount) {
      const targetID = nodes[Math.floor(Math.random() * nodeCount)];
      if (targetID !== sourceID && !ids.has(targetID)) {
        ids.add(targetID);
        edges.push([sourceID, targetID]);
      }
    }
  }
  return { nodes, edges };
}
