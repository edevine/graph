import { JSX, render } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import createGraphData, { GraphData } from '../../lib/util/createGraphData';
import forceDirectedLayout from '../../lib/layouts/forceDirectedLayout';
import drawGraph from '../../lib/render/drawGraph';
import resetGraphZoom from '../../lib/render/resetGraphZoom';
import getLayoutBoundingRect from '../../lib/layouts/getLayoutBoundingRect';

const canvasStyle = {
  display: 'block',
  postion: 'fixed',
  top: '0',
  left: '0',
};

function App(): JSX.Element {
  const initRef = useRef(false);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  const graphData = useMemo(() => createGraphData(20, 1, 1), []);
  const [layout, setLayout] = useState({
    xAxis: new Float64Array(graphData.nodes.length),
    yAxis: new Float64Array(graphData.nodes.length),
  });

  useEffect(() => {
    let handle = 0;
    const callback = () => {
      setLayout(forceDirectedLayout(graphData, layout));
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
      drawGraph(context, graphData, layout);
    }
  }, [canvas, layout]);

  const canvasSize = useMemo(
    () => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }),
    [],
  );

  return <canvas style={canvasStyle} ref={setCanvas} {...canvasSize} />;
}

render(<App />, document.getElementById('app')!);
