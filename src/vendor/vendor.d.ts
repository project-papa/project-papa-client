declare module 'keyboardevent-key-polyfill' {
  export function polyfill();
}

declare module 'myo' {
  namespace Myo {
    type PoseName = 'fingers_spread' | 'wave_in' | 'wave_out' | 'fist' | 'double_tap';
    type PoseOffName = 'fingers_spread_off' | 'wave_in_off' | 'wave_out_off' | 'fist_off' | 'double_tap_off';

    type EventName = keyof MyoEventArgs;

    interface MyoEventArgs {
      pose: PoseName;
      pose_off: PoseOffName;
      connected: void;
    }

    function connect(name: string): void;
    function setLockingPolicy(policy: 'standard' | 'none'): void;
    function on<T extends EventName>(event: T, callback: (data: MyoEventArgs[T]) => void): void;
    function off<T extends EventName>(event: T, callback: (data: MyoEventArgs[T]) => void): void;
    // tslint:disable-next-line:prefer-const
    let onError: (e: any) => void;
  }

  export = Myo;
}

declare module 'file-loader!*' {
  const uri: string;
  export = uri;
}
