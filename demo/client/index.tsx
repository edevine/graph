import { JSX, render } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import createGraphData from '../../lib/util/createGraphData';
import circularLayout from '../../lib/layouts/circularLayout';
import drawGraph from '../../lib/render/drawGraph';
import resetGraphZoom from '../../lib/render/resetGraphZoom';
import getLayoutBoundingRect from '../../lib/layouts/getLayoutBoundingRect';

function App(): JSX.Element {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  const graphData = useMemo(() => createGraphData(100, 3, 1), []);
  const layout = useMemo(() => circularLayout(graphData, { minDistance: 40 }), []);
  const bound = useMemo(() => getLayoutBoundingRect(layout), [layout]);

  useEffect(() => {
    if (canvas != null) {
      const context = canvas.getContext('2d')!;
      resetGraphZoom(context, bound, 20);
      drawGraph(context, graphData, layout);
    }
  }, [canvas]);

  return <canvas ref={setCanvas} width={800} height={600} />;
}

render(<App />, document.getElementById('app')!);
