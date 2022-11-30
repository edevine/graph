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
  const graphRef = useRef<Graph | null>(null);
  const layoutTypeRef = useRef<LayoutType>('force-directed');
  const newLayoutRef = useRef(true);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  const setLayoutType = (layoutType: LayoutType) => {
    newLayoutRef.current = true;
    layoutTypeRef.current = layoutType;
    graphRef.current?.setLayout(layoutType);
  };

  const graphData = useMemo(() => createGraphData(20, 1, 1), []);

  useEffect(() => {
    if (canvas != null) {
      const graph = new Graph(canvas);
      graphRef.current = graph;
      return graph.init();
    }
  }, [canvas]);

  useEffect(() => {
    if (canvas == null) {
      return;
    }
    let handle = 0;
    const callback = () => {
      graphRef.current?.layout(graphData);
      graphRef.current?.draw(graphData);
      handle = requestAnimationFrame(callback);
    };
    handle = requestAnimationFrame(callback);
    return () => cancelAnimationFrame(handle);
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
      <Toolbar value={layoutTypeRef.current} onChange={setLayoutType} />
    </>
  );
}

render(<App />, document.getElementById('app')!);
