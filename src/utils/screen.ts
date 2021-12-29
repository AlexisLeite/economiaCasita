import { Suscribe } from './suscribers';

export type ScreenProperties = {
  width: number;
  height: number;
};

let objective: HTMLElement | undefined;
let scrollObjective: number | undefined;
let lastTimestamp: number | undefined;
let nextScroll = 0;
let speed = 1;
const acceleration = 100;
const scrollAttachAmmount = 200;
let attachTimeout: NodeJS.Timeout;

const Screen = {
  get dimensions(): ScreenProperties {
    if (typeof window !== 'undefined')
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    return {
      width: 0,
      height: 0,
    };
  },
  get orientation(): 'portrait' | 'landscape' {
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  },
  attachScroll(selector: string) {
    const results = document.querySelectorAll(selector);
    const resultsArray: HTMLElement[] = [];
    results.forEach((result) => resultsArray.push(result as HTMLElement));
    let lastScroll = window.scrollY;

    return Suscribe(document.body, 'wheel', () => {
      scrollObjective = undefined;
      if (attachTimeout) clearTimeout(attachTimeout);
      setTimeout(() => {
        if (window.scrollY > lastScroll) {
          // Going down

          for (let element of resultsArray) {
            if (
              element.offsetTop > window.scrollY &&
              element.offsetTop < window.scrollY + window.innerHeight / 4
            ) {
              attachTimeout = setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
              break;
            }
          }
        } else {
          // Going up

          for (let element of resultsArray) {
            if (
              element.offsetTop < window.scrollY &&
              element.offsetTop > window.scrollY - window.innerHeight / 4
            ) {
              attachTimeout = setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
              break;
            }
          }
        }
        lastScroll = window.scrollY;
      }, 100);
    });
  },
  scroll(to: 'up' | 'down' | 'current') {
    if (nextScroll > Date.now()) return;
    nextScroll = Date.now() + 400;

    const stages = [
      ...((document.getElementById('Index')!.querySelectorAll('.Stage') ?? []) as any),
    ];
    let selected = 0;
    stages.forEach((current, index) => {
      if (current.classList.contains('Focused') || current.offsetTop === window.scrollY) {
        selected = index;
      }
    });

    if (to === 'down') {
      if (selected + 1 === stages.length) return;
      stages[selected].classList.remove('Focused');
      stages[selected + 1].classList.add('Focused');
      Screen.scrollTo(stages[selected + 1]);
    } else if (to === 'up') {
      if (selected === 0) return;
      stages[selected].classList.remove('Focused');
      stages[selected - 1].classList.add('Focused');
      Screen.scrollTo(stages[selected - 1]);
    } else {
      window.scroll(window.scrollX, stages[selected].offsetTop);
    }
  },
  scrollTo(arg: HTMLElement | number) {
    if (arg instanceof HTMLElement) {
      objective = arg;
      arg = arg.offsetTop;
      document.querySelector('.Focused')?.classList.remove('Focused');
    } else {
      objective = undefined;
    }

    scrollObjective = arg;

    const scroll = (timestamp: number) => {
      if (typeof scrollObjective === 'undefined') return;
      const elapsed = (timestamp - (lastTimestamp ?? timestamp)) / 1000;
      lastTimestamp = timestamp;
      const remaining = Math.abs(scrollObjective - window.scrollY);

      let scrollAmmount = remaining < speed * elapsed ? remaining : speed * elapsed;
      if (scrollObjective < window.scrollY) scrollAmmount *= -1;

      const newScroll = window.scrollY + scrollAmmount;
      window.scroll(window.scrollX, newScroll);

      speed += acceleration;

      if (newScroll !== scrollObjective) window.requestAnimationFrame(scroll);
      else {
        speed = 10;
        lastTimestamp = undefined;
        if (typeof objective !== 'undefined') {
          if (!objective.classList.contains('Stage'))
            while (
              !(objective.parentNode as HTMLElement).classList.contains('Stage') &&
              objective.parentNode !== document.body
            ) {
              objective = objective.parentNode as HTMLElement;
            }
          const firstButton = objective.querySelector('button,input,textarea,a');
          if (typeof firstButton !== 'undefined' && firstButton !== null)
            (firstButton as HTMLElement).focus();
        }
        objective = undefined;
      }
    };
    window.requestAnimationFrame(scroll);
  },
};

export default Screen;
