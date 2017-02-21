declare module "myo" {
  class Myo {
    setLockingPolicy(policy: string): Myo;
    on(eventname: string, fn: (data: any) => void): string;
    connect(namespace: string): void;
  }

  declare const GlobalMyo: Myo;

  export = GlobalMyo;
}
