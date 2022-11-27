import { Layout } from './Layout';

export default function getLayoutBoundingRect({ xAxis, yAxis }: Layout): DOMRect {
  const minX = Math.min(...xAxis);
  const maxX = Math.max(...xAxis);
  const minY = Math.min(...yAxis);
  const maxY = Math.max(...yAxis);
  const width = maxX - minX;
  const height = maxY - minY;
  return new DOMRect(minX, minY, width, height);
}
