import type { GraphData } from '../../lib/util/createGraphData';
import { JSX, render } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import Graph from '../../lib/Graph';
import Toolbar from './Toolbar';
import SettingsProvider from './SettingsProvider';
import parseEdgeList from '../../lib/util/parseEdgeList';

const canvasStyle = {
  display: 'block',
  position: 'fixed',
  top: '0px',
  left: '0px',
};

function App(): JSX.Element {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const fetched = useRef(false);
  const init = useRef(false);

  if (!fetched.current) {
    fetched.current = true;
    fetch('data/facebook_combined.txt')
      .then((response) => response.text())
      .then((text) => setGraphData(parseEdgeList(text)));
  }
  useEffect(() => {
    if (canvas && graphData && !init.current) {
      init.current = true;
      const graph = new Graph(canvas);
      graph.setData(graphData);
      graph.setLayoutType('force-directed');
      setGraph(graph);
      return graph.init();
    }
  }, [canvas, graphData]);

  const canvasSize = useMemo(
    () => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }),
    [],
  );

  return (
    <SettingsProvider>
      <canvas style={canvasStyle} ref={setCanvas} {...canvasSize} />
      {graph && <Toolbar graph={graph} />}
    </SettingsProvider>
  );
}

render(<App />, document.getElementById('app')!);
