export interface SmoothValue {
  getValue(): number;
  getTarget(): number;
  setTarget(val: number): void;
  update(delta: number): void;
  reset(): void;
}

export class ExponentialAverage implements SmoothValue {
  private alpha: number;
  private value: number;
  private target: number;

  constructor(alpha: number, initial: number) {
    this.alpha = alpha;
    this.value = initial;
    this.target = initial;
  }

  getValue() {
    return this.value;
  }

  getTarget() {
    return this.target;
  }

  setTarget(val: number) {
    this.target = val;
  }

  update(delta: number) {
    this.value = this.alpha * this.target + (1 - this.alpha) * this.value;
  }

  reset() {
    this.value = 0;
    this.target = 0;
  }
}
