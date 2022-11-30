import { JSX } from 'preact';
import Graph, { LayoutType } from '../../lib/Graph';

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
  backgroundColor: '#eee',
  borderRadius: '3px',
  padding: '5px',
  pointerEvents: 'auto',
};

type Props = {
  graph: Graph;
};

export default function Toolbar({ graph }: Props): JSX.Element {
  const setLayoutType = (event: Event) => {
    const element = event.target as HTMLSelectElement;
    graph.setLayout(element.value as LayoutType);
  };

  return (
    <div style={toolbarContainerStyle}>
      <div style={toolbarStyle}>
        <select onChange={setLayoutType} value={graph.getLayoutType()}>
          <option value="circular">Circular</option>
          <option value="force-directed">Force Directed</option>
        </select>
      </div>
    </div>
  );
}
