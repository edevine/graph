export type Layout = {
  xAxis: Float64Array;
  yAxis: Float64Array;
};

export interface GraphLayout {
  layout(previousLayout: Layout, lockedNodes: Set<number>): Layout;
}
