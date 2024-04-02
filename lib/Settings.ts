export type LayoutType = 'circular' | 'force-directed' | 'none';

export type Settings = {
  layouts: LayoutSettings;
};

export type LayoutSettings = {
  circular: {
    minDistance: number;
  };
  forceDirected: {
    gravity: number;
    force: number;
  };
};

export const defaultSettings: Settings = {
  layouts: {
    circular: {
      minDistance: 40,
    },
    forceDirected: {
      gravity: 0.02,
      force: 100,
    },
  },
};

export function setCircularMinDistance(settings: Settings, minDistance: number): Settings {
  return {
    ...settings,
    layouts: {
      ...settings.layouts,
      circular: {
        ...settings.layouts.circular,
        minDistance,
      },
    },
  };
}

export function setForceDirectedGravity(settings: Settings, gravity: number): Settings {
  return {
    ...settings,
    layouts: {
      ...settings.layouts,
      forceDirected: {
        ...settings.layouts.forceDirected,
        gravity,
      },
    },
  };
}

export function setForceDirectedForce(settings: Settings, force: number): Settings {
  return {
    ...settings,
    layouts: {
      ...settings.layouts,
      forceDirected: {
        ...settings.layouts.forceDirected,
        force,
      },
    },
  };
}

export function getForceDirectedGravity(settings: Settings): number {
  return settings.layouts.forceDirected.gravity;
}
