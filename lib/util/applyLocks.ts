import { Layout } from '../layouts/Layout';

export default function applyLocks(layout: Layout, locked: Map<number, [number, number]>): void {
  locked.forEach((pos, i) => {
    layout[0][i] = pos[0];
    layout[1][i] = pos[1];
  });
}
