import { JSX, render } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import createGraphData from '../../lib/util/createGraphData';
import Graph, { LayoutType } from '../../lib/Graph';
import Toolbar from './Toolbar';

const canvasStyle = {
  display: 'block',
  position: 'fixed',
  top: '0px',
  left: '0px',
};

function App(): JSX.Element {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const graphData = useMemo(() => createGraphData(20, 1, 1), []);

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
    <>
      <canvas style={canvasStyle} ref={setCanvas} {...canvasSize} />
      {graph && <Toolbar graph={graph} />}
    </>
  );
}

render(<App />, document.getElementById('app')!);
