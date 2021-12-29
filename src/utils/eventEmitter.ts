type EventMap = Record<string, any>;
type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;
type fun = () => void;

interface Emitter<T extends EventMap> {
  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): fun;
  off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  emit<K extends EventKey<T>>(eventName: K, params: T[K]): void;
}

function eventEmitter<T extends EventMap>(): Emitter<T> {
  const listeners: {
    [K in keyof EventMap]?: Array<(p: EventMap[K]) => void>;
  } = {};

  return {
    on(key, fn) {
      if (!Array.isArray(listeners[key])) listeners[key] = [];
      listeners[key]?.push(fn);
      return () => this.off(key, fn);
    },
    off(key, fn) {
      listeners[key] = (listeners[key] || []).filter((cb) => cb !== fn);
    },
    emit(key, data) {
      (listeners[key] || []).forEach((fn) => fn(data));
    },
  };
}

export default class EventEmitter<T extends EventMap> implements Emitter<T> {
  private emitter = eventEmitter<T>();
  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>) {
    this.emitter.on(eventName, fn);
    return () => this.emitter.off(eventName, fn);
  }

  off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>) {
    this.emitter.off(eventName, fn);
  }

  emit<K extends EventKey<T>>(eventName: K, params: T[K]) {
    this.emitter.emit(eventName, params);
  }
}
