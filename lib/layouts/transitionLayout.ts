import { GraphLayout, Layout } from './Layout';

export default function* transitionLayout(
  first: Layout,
  last: Layout,
  duration: number,
): Iterator<Layout, Layout> {
  const length = last[0].length;
  let startTime = null;
  let inProgress = true;
  while (inProgress) {
    if (startTime == null) {
      startTime = Date.now();
      yield first;
    }
    const elapsed = Date.now() - startTime;
    if (elapsed >= duration) {
      inProgress = false;
      yield last;
    }
    const progress = elapsed / duration;
    const xAxis = new Float64Array(length);
    const yAxis = new Float64Array(length);
    for (let i = 0; i < length; i++) {
      xAxis[i] = first[0][i] + (last[0][i] - first[0][i]) * progress;
      yAxis[i] = first[1][i] + (last[1][i] - first[1][i]) * progress;
    }
    yield [xAxis, yAxis];
  }
  return last;
}
