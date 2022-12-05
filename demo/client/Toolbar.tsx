import { JSX } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import Graph, { LayoutType } from '../../lib/Graph';
import SettingsContext from './SettingsContext';
import SettingsMenu from './SettingsMenu';

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
  const [settings] = useContext(SettingsContext);
  const [layoutType, setLayoutType] = useState(graph.getLayoutType());
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    graph.setLayout(layoutType);
  }, [layoutType]);

  const onChangeLayoutType = (event: Event) => {
    const element = event.target as HTMLSelectElement;
    setLayoutType(element.value as LayoutType);
    graph.setLayout(element.value as LayoutType);
  };

  return (
    <>
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
