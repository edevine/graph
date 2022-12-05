import { JSX } from 'preact';
import { useState } from 'preact/hooks';
import SettingsContext from './SettingsContext';
import { defaultSettings, Settings } from '../../lib/Settings';

type Props = {
  children: (JSX.Element | null) | (JSX.Element | null)[];
};

export default function SettingsProvider({ children }: Props) {
  const settingsState = useState<Settings>(defaultSettings);
  return <SettingsContext.Provider value={settingsState}>{children}</SettingsContext.Provider>;
}
