import { JSX } from 'preact';
import Graph, { LayoutType } from '../../lib/Graph';
import {
  Settings,
  setForceDirectedForce,
  setForceDirectedGravity,
  setForceDirectedVelocity,
  setCircularMinDistance,
} from '../../lib/Settings';
import SettingsContext from './SettingsContext';
import { useContext, useEffect } from 'preact/hooks';

const modalStyle = {
  backgroundColor: 'rgba(238, 238, 238, 0.5)',
  borderRadius: '3px',
  padding: '5px',
  position: 'fixed',
  right: '10px',
  top: '10px',
};

const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

type Props = {
  graph: Graph;
  layoutType: LayoutType;
};

export default function Settings({ graph, layoutType }: Props): JSX.Element | null {
  const [settings, setSettings] = useContext(SettingsContext);

  useEffect(() => {
    return graph.setSettings(settings);
  }, [graph, settings]);

  const onChangeMinDistance = (event: Event) => {
    setSettings((settings) => {
      const element = event.target as HTMLSelectElement;
      return setCircularMinDistance(settings, Number(element.value));
    });
  };

  const onChangeGravity = (event: Event) => {
    setSettings((settings) => {
      const element = event.target as HTMLSelectElement;
      return setForceDirectedGravity(settings, Number(element.value));
    });
  };

  const onChangeForce = (event: Event) => {
    setSettings((settings) => {
      const element = event.target as HTMLSelectElement;
      return setForceDirectedForce(settings, Number(element.value));
    });
  };

  const onChangeVelocity = (event: Event) => {
    setSettings((settings) => {
      const element = event.target as HTMLSelectElement;
      return setForceDirectedVelocity(settings, Number(element.value));
    });
  };

  if (layoutType === 'circular') {
    return (
      <div style={modalStyle}>
        <label style={labelStyle}>
          Min Distance
          <input
            type="number"
            max="100"
            min="10"
            step="5"
            value={settings.layouts.circular.minDistance}
            onChange={onChangeMinDistance}
          />
        </label>
      </div>
    );
  }

  if (layoutType === 'force-directed') {
    return (
      <div style={modalStyle}>
        <label style={labelStyle}>
          Gravity
          <input
            type="number"
            min="0"
            step="0.01"
            value={settings.layouts.forceDirected.gravity}
            onChange={onChangeGravity}
          />
        </label>
        <label style={labelStyle}>
          Force
          <input
            type="number"
            min="0"
            step="1"
            value={settings.layouts.forceDirected.force}
            onChange={onChangeForce}
          />
        </label>
        <label style={labelStyle}>
          Velocity
          <input
            type="number"
            max="1"
            min="0.01"
            step="0.01"
            value={settings.layouts.forceDirected.velocity}
            onChange={onChangeVelocity}
          />
        </label>
      </div>
    );
  }

  return null;
}
