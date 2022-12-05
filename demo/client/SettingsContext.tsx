import { createContext } from 'preact';
import { StateUpdater } from 'preact/hooks';
import { defaultSettings, Settings } from '../../lib/Settings';

export default createContext<[Settings, StateUpdater<Settings>]>([defaultSettings, () => {}]);
