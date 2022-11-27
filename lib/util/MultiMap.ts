export default class MultiMap<K, V> {
  #map = new Map<K, Set<V>>();

  get(key: K): Set<V> | undefined {
    return this.#map.get(key);
  }

  add(key: K, value: V): this {
    if (!this.#map.has(key)) {
      this.#map.set(key, new Set());
    }
    this.#map.get(key)!.add(value);
    return this;
  }

  has(key: K): boolean {
    const set = this.#map.get(key);
    return set != null && set.size > 0;
  }

  sizeAt(key: K): number {
    return this.#map.get(key)?.size ?? 0;
  }
}
