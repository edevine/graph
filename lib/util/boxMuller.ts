/**
 * Returns a random number conforming to a dataset of the provided means
 * and variance oer the Box-Muller algorithm.
 */
export default function boxMuller(mean: number, variance: number): () => number {
  let phase = 0;
  let z0 = 0;
  let z1 = 0;

  const generate = (): void => {
    while (1) {
      const u = 2 * Math.random() - 1.0;
      const v = 2 * Math.random() - 1.0;
      let s = Math.pow(u, 2) + Math.pow(v, 2);
      if (s > 0.0 && s < 1.0) {
        const p = Math.sqrt((-2.0 * Math.log(s)) / s);
        z0 = u * p;
        z1 = v * p;
        break;
      }
    }
  };

  return () => {
    phase = 1 - phase;
    if (phase == 0) {
      return z1 * variance + mean;
    } else {
      generate();
      return z0 * variance + mean;
    }
  };
}
