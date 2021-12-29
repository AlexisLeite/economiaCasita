import Screen from './screen';

const Navigation = {
  scrollTo(ariaLabel: string) {
    return () => {
      let target = document.querySelector(`[aria-label="${ariaLabel}"]`) as HTMLElement;
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    };
  },
};

export default Navigation;
