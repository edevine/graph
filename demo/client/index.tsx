import { JSX, render } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import createGraphData from '../../lib/util/createGraphData';
import circularLayout from '../../lib/layouts/circularLayout';
import forceDirectedLayout from '../../lib/layouts/forceDirectedLayout';
import resetGraphZoom from '../../lib/render/resetGraphZoom';
import getLayoutBoundingRect from '../../lib/layouts/getLayoutBoundingRect';
import Graph from '../../lib/Graph';
import Toolbar, { LayoutType } from './Toolbar';

const canvasStyle = {
  display: 'block',
  position: 'fixed',
  top: '0px',
  left: '0px',
};

const iterativeLayouts = new Set<LayoutType>(['force-directed']);

function App(): JSX.Element {
  const graphRef = useRef<Graph | null>(null);
  const initRef = useRef(false);
  const layoutTypeRef = useRef<LayoutType>('force-directed');
  const newLayoutRef = useRef(true);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  const setLayoutType = (layoutType: LayoutType) => {
    newLayoutRef.current = true;
    layoutTypeRef.current = layoutType;
  };

  const graphData = useMemo(() => createGraphData(20, 1, 1), []);
  const [layout, setLayout] = useState({
    xAxis: new Float64Array(graphData.nodes.length),
    yAxis: new Float64Array(graphData.nodes.length),
  });

  useEffect(() => {
    if (canvas != null) {
      const graph = new Graph(canvas);
      graphRef.current = graph;
      return graph.init();
    }
  }, [canvas]);

  useEffect(() => {
    let handle = 0;
    const callback = () => {
      const layoutType = layoutTypeRef.current;
      if (newLayoutRef.current || iterativeLayouts.has(layoutType)) {
        newLayoutRef.current = false;
        switch (layoutType) {
          case 'circular':
            setLayout(circularLayout(graphData, { minDistance: 40 }));
            break;
          case 'force-directed':
            setLayout(forceDirectedLayout(graphData, layout));
            break;
        }
      }
      handle = requestAnimationFrame(callback);
    };
    handle = requestAnimationFrame(callback);
    return () => cancelAnimationFrame(handle);
  }, []);

  useEffect(() => {
    if (canvas != null) {
      const context = canvas.getContext('2d')!;
      const bound = getLayoutBoundingRect(layout);
      if (!initRef.current) {
        initRef.current = true;
        resetGraphZoom(context, bound, 20);
      }
      graphRef.current?.draw(graphData, layout);
    }
  }, [canvas, layout]);

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
