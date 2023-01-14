import type { LayoutSettings, LayoutType } from '../Settings';
import type { GraphLayout, Layout } from '../layouts/Layout';
import NoLayout from '../layouts/NoLayout';
import { defaultSettings } from '../Settings';
import { GraphData } from '../util/createGraphData';
import ForceDirectedLayout from '../layouts/ForceDirectedLayout';
import CircularLayout from '../layouts/CircularLayout';

export interface LayoutWorker extends Worker {
  postMessage(message: LayoutWorkerRequest): void;
  onmessage: ((this: LayoutWorker, ev: MessageEvent<Layout>) => void) | null;
}

export type LayoutWorkerRequest =
  | ['setData', GraphData]
  | ['setLayout', LayoutType]
  | ['runLayout', Set<number>]
  | ['setSettings', LayoutSettings];

class LayoutWorkerImpl {
  #prevLayout: Layout = {
    xAxis: new Float64Array(),
    yAxis: new Float64Array(),
  };
  #layoutType: LayoutType = 'none';
  #layoutImpl: GraphLayout = new NoLayout();
  #settings = defaultSettings.layouts;
  #data: GraphData = { nodes: [], edges: [] };

  handleRequest(msg: LayoutWorkerRequest): void {
    switch (msg[0]) {
      case 'setData':
        this.setData(msg[1]);
        break;
      case 'setLayout':
        this.setLayout(msg[1]);
        break;
      case 'runLayout':
        this.runLayout(msg[1]);
        break;
      case 'setSettings':
        this.setSettings(msg[1]);
        break;
    }
  }

  setData(data: GraphData): void {
    this.#data = data;
    this.#prevLayout = {
      xAxis: new Float64Array(data.nodes.length),
      yAxis: new Float64Array(data.nodes.length),
    };
    this.setLayout(this.#layoutType, true);
  }

  setLayout(layoutType: LayoutType, force: boolean = false): void {
    if (force || this.#layoutType !== layoutType) {
      this.#layoutType = layoutType;
      switch (layoutType) {
        case 'circular':
          this.#layoutImpl = new CircularLayout(this.#settings.circular, this.#data);
          break;
        case 'force-directed':
          this.#layoutImpl = new ForceDirectedLayout(this.#settings.forceDirected, this.#data);
          break;
        case 'none':
          this.#layoutImpl = new NoLayout();
          break;
      }
    }
  }

  setSettings(settings: LayoutSettings): void {
    this.#settings = settings;
    if (this.#layoutImpl instanceof CircularLayout) {
      this.#layoutImpl.setSettings(settings.circular);
    } else if (this.#layoutImpl instanceof ForceDirectedLayout) {
      this.#layoutImpl.setSettings(settings.forceDirected);
    }
  }

  runLayout(lockedNodes: Set<number>): void {
    this.#prevLayout = this.#layoutImpl.layout(this.#prevLayout, lockedNodes);
    self.postMessage(this.#prevLayout);
  }
}

const worker = new LayoutWorkerImpl();

self.onmessage = (event) => worker.handleRequest(event.data);
