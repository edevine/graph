import { JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import Graph from '../../lib/Graph';
import { LayoutType } from '../../lib/Settings';
import SettingsMenu from './SettingsMenu';

const fpsStyle = {
  backgroundColor: 'rgba(238, 238, 238, 0.5)',
  borderRadius: '3px',
  left: '10px',
  padding: '5px',
  pointerEvents: 'none',
  position: 'fixed',
  top: '10px',
};

const toolbarContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  left: '10px',
  pointerEvents: 'none',
  position: 'fixed',
  right: '10px',
  top: '10px',
};

const toolbarStyle = {
  backgroundColor: 'rgba(238, 238, 238, 0.5)',
  borderRadius: '3px',
  padding: '5px',
  pointerEvents: 'auto',
};

type Props = {
  graph: Graph;
};

export default function Toolbar({ graph }: Props): JSX.Element {
  const [layoutType, setLayoutType] = useState(graph.getLayoutType());
  const [showSettings, setShowSettings] = useState(false);
  const [fps, setFps] = useState(0);

  useEffect(() => {
    graph.setLayout(layoutType);
  }, [layoutType]);

  useEffect(() => {
    let time = Date.now();
    return graph.onRender(() => {
      const oldTime = time;
      time = Date.now();
      setFps(Math.round(1000 / (time - oldTime)));
    });
  }, [graph]);

  const onChangeLayoutType = (event: Event) => {
    const element = event.target as HTMLSelectElement;
    setLayoutType(element.value as LayoutType);
    graph.setLayout(element.value as LayoutType);
  };

  return (
    <>
      <div style={fpsStyle}>{fps} FPS</div>
      <div style={toolbarContainerStyle}>
        <div style={toolbarStyle}>
          <select onChange={onChangeLayoutType} value={layoutType}>
            <option value="circular">Circular</option>
            <option value="force-directed">Force Directed</option>
          </select>
          <button onClick={() => setShowSettings((value) => !value)}>Settings</button>
        </div>
      </div>
      {showSettings && <SettingsMenu graph={graph} layoutType={layoutType} />}
    </>
  );
}
