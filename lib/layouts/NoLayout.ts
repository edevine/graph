import { GraphLayout, Layout } from './Layout';

export default class NoLayout implements GraphLayout {
  layout(previousLayout: Layout): Layout {
    return previousLayout;
  }
}
