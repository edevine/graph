import { JSX, render } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import createGraphData from '../../lib/util/createGraphData';
import Graph from '../../lib/Graph';
import Toolbar from './Toolbar';
import SettingsProvider from './SettingsProvider';

const canvasStyle = {
  display: 'block',
  position: 'fixed',
  top: '0px',
  left: '0px',
};

function App(): JSX.Element {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const graphData = useMemo(() => createGraphData(1000, 1, 1), []);

  useEffect(() => {
    if (canvas != null) {
      const graph = new Graph(canvas);
      graph.setData(graphData);
      graph.setLayout('force-directed');
      setGraph(graph);
      return graph.init();
    }
  }, [canvas]);

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
