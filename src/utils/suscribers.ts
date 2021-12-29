export type Unsuscriber = () => void;

export function Suscribe<K extends keyof HTMLElementEventMap>(
  target: HTMLElement,
  type: K,
  callback: (this: HTMLElement, evt: HTMLElementEventMap[K]) => void
): Unsuscriber;
export function Suscribe<K extends keyof DocumentEventMap>(
  target: Document,
  type: K,
  callback: (this: Document, evt: DocumentEventMap[K]) => void
): Unsuscriber;
export function Suscribe<K extends keyof WindowEventMap>(
  target: Window,
  type: K,
  callback: (this: Window, evt: WindowEventMap[K]) => void
): Unsuscriber;
export function Suscribe<K extends keyof SVGElementEventMap>(
  target: SVGElement,
  type: K,
  callback: (this: SVGElement, evt: SVGElementEventMap[K]) => void
): Unsuscriber;
export function Suscribe(
  target: any,
  type: any,
  callback: (this: any, evt: any) => void
): Unsuscriber {
  target.addEventListener(type, callback);
  return () => target.removeEventListener(type, callback);
}

export function Unsuscribe(...unsuscriptions: (() => void)[]) {
  return () => unsuscriptions.forEach((unsuscribe) => unsuscribe());
}

export function SetTimeout(callback: () => void, time: number) {
  const timeout = setTimeout(callback, time);
  return () => clearTimeout(timeout);
}
