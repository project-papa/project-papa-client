import { Observable } from 'rxjs';

/**
 * Operator to be used in Observable.let that gets the last two emitted values from the observable
 */
export function lastTwo<T>(obs: Observable<T>) {
  return obs
    .bufferCount(2, 1)
    // The final emission of the buffer contains undefined as its second element
    // This leads to NaNs so we get rid of it
    .filter(values => values[1] !== undefined);
}
