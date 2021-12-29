import EventEmitter from './eventEmitter';

export type MouseProps = {
  x: number;
  y: number;
};

if (typeof document !== 'undefined')
  document.addEventListener('mousemove', (ev: MouseEvent) => {
    const mouseProps: MouseProps = (({ clientX: x, clientY: y }) => ({ x, y }))(ev);
    Mouse.emit('move', mouseProps);
  });

const Mouse = new (class extends EventEmitter<{ move: MouseProps }> {})();

export default Mouse;
