/* The idea is to create a system which could handle all keypress and keydown events in order to give the ui an interesting keyboard usage.

What if two ui elements compete to gain acces to a key?

Possible solutions:
-if one share but the other dont, give to that whom dont
-allow the most important: through the 'depth' prop
import { exists } from './common';

*/
export function exists(obj: { [key: string]: any }, route: string) {
  const splitRoute = route.split('.');
  for (let dir of splitRoute) {
    if (!(typeof obj === 'object' || typeof obj === 'function') || obj === null || !(dir in obj))
      return false;
    obj = obj[dir];
  }

  return obj as any;
}

interface Register {
  listener: () => void;
  modifiers: { [key: string]: boolean };
  timestamp: number;
}

interface Props {
  type?: 'keypress' | 'keydown' | 'keyup';
  depth?: number;
  [key: string]: any;
}

export const Key = new (class {
  registers: { [key: string]: { [key: string]: { [key: number]: Register[] } } } = {};
  debug = 0; // 0-No, 1-Events, 2-Events&registers
  modifiers = ['altKey', 'ctrlKey', 'shiftKey'];

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', this.listener);
      document.addEventListener('keypress', this.listener);
      document.addEventListener('keyup', this.listener);
    }
  }

  checkModifiers(ev: KeyboardEvent & { [key: string]: any }, listener: Register) {
    for (let modifier of this.modifiers) {
      if (modifier in listener.modifiers && listener.modifiers[modifier] !== ev[modifier])
        return false;
    }
    return true;
  }

  listener = (ev: KeyboardEvent) => {
    if (this.debug >= 1) console.log(ev);
    if (this.debug >= 2) console.log(this.registers);

    let key = ev.key.toLowerCase();
    const availableDepths = exists(this.registers, `${ev.type}.${key}`);
    if (availableDepths) {
      let depths = Object.keys(availableDepths).sort((a, b) => {
        return parseInt(b) - parseInt(a);
      });
      for (let i = 0; i < depths.length; i++) {
        let listeners = availableDepths[depths[i]];

        if (Array.isArray(listeners) && listeners.length) {
          if (listeners.length === 1) {
            let listener = listeners[0];
            if (this.checkModifiers(ev, listener)) {
              listener.listener(ev);
              return;
            }
          }
          if (listeners.length > 1) {
            let listener = listeners.reduce((acc, act) => {
              if (!this.checkModifiers(ev, act)) return acc;
              if (!acc || !('timestamp' in acc)) return act;

              return acc.timestamp > act.timestamp ? acc : act;
            }, false);
            if (listener) {
              listener.listener();
              return;
            }
          }
        }
      }
    }
  };

  up(key: string, listener: () => void, props: Props = {}) {
    props.type = 'keyup';

    return this.on(key, listener, props);
  }

  down(key: string, listener: () => void, props: Props = {}) {
    props.type = 'keydown';

    key = key.toLowerCase();
    if (this.modifiers.includes(`${key}Key`)) props[`${key}Key`] = true;

    return this.on(key, listener, props);
  }

  on(key: string, listener: () => void, props: Props = {}) {
    key = key.toLowerCase();

    let depth = props.depth ?? 0;
    let type = props.type ?? 'keypress';
    let modifiers = {};

    this.registers[type] ??= {};
    this.registers[type][key] ??= {};
    this.registers[type][key][depth] ??= [];
    this.registers[type][key][depth].push({ listener, modifiers, timestamp: Date.now() });

    return () => {
      this.registers[type][key][depth] = this.registers[type][key][depth].filter(
        (search) => search.listener !== listener
      );
    };
  }
})();

export default Key;
