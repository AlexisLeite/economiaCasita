let timers: { callback: (args?: any) => any; timer: any }[] = [];
let lastId: number = 0;

export function debounce(callback: (args?: any) => any, timeout = 300, ...args: any) {
  let registry = timers.find((el) => {
    return callback === el.callback;
  });
  if (registry) {
    clearTimeout(registry.timer);
  } else {
    registry = { timer: 0, callback };
    timers.push(registry);
  }

  registry.timer = setTimeout(() => {
    registry.callback(...args);
  }, timeout);
}
