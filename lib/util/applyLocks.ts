import { Layout } from '../layouts/Layout';

export default function applyLocks(layout: Layout, locked: Map<number, [number, number]>): void {
  locked.forEach((pos, i) => {
    layout.xAxis[i] = pos[0];
    layout.yAxis[i] = pos[1];
  });
}
