import { JSX } from 'preact';
import { LayoutType } from '../../lib/Graph';

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
  value: LayoutType;
  onChange: (value: LayoutType) => void;
};

export default function Toolbar(props: Props): JSX.Element {
  const onChange = (event: Event) => {
    const element = event.target as HTMLSelectElement;
    props.onChange(element.value as LayoutType);
  };
  return (
    <div style={toolbarContainerStyle}>
      <div style={toolbarStyle}>
        <select onChange={onChange} value={props.value}>
          <option value="circular">Circular</option>
          <option value="force-directed">Force Directed</option>
        </select>
      </div>
    </div>
  );
}
