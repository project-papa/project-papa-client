import { Observable } from 'rxjs';

/**
 * Operator to be used in Observable.let that gets the difference between the the last two values
 */
export function difference(obs: Observable<number>) {
  return obs
    .bufferCount(2, 1)
    // The final emission of the buffer contains undefined as its second element
    // This leads to NaNs so we get rid of it
    .filter(values => values[1] !== undefined)
    .map(([prevValue, currentValue]) => currentValue - prevValue);
}
