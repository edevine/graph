export type Layout = [Float64Array, Float64Array];

export interface GraphLayout {
  layout(previousLayout: Layout): Layout;
}
