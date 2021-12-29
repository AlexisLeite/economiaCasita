type SelectorCallback = (element: Element) => boolean;

export function focusNextElement(parentSelector: SelectorCallback) {
  return focus(parentSelector);
}

export function focusPreviousElement(parentSelector: SelectorCallback) {
  return focus(parentSelector, false);
}

function focus(parentSelector: SelectorCallback, next: boolean = true) {
  //add all elements we want to include in our selection
  var focussableElements =
    'a:not([disabled]), button:not([disabled]), input[type=text]:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';

  if (document.activeElement) {
    let parent: any = document.activeElement;
    do {
      if (parent && parentSelector(parent)) {
        // Make the selection
        var focussable = Array.prototype.filter.call(
          parent.querySelectorAll(focussableElements),
          function (element) {
            //check for visibility while always include the current activeElement
            return (
              element.offsetWidth > 0 ||
              element.offsetHeight > 0 ||
              element === document.activeElement
            );
          }
        );
        var index = focussable.indexOf(document.activeElement);
        if (index > -1) {
          var nextElement;
          if (next) nextElement = focussable[index + 1] || focussable[0];
          else nextElement = focussable[index - 1] || focussable[focussable.length - 1];
          nextElement.focus();
        }
      }
      parent = parent.parentElement;
    } while (parent);
  }
}
