const debounce = (
  func: (args: any) => void,
  wait: number,
  immediate?: boolean
) => {
  let timeout: null | number;
  return function() {
    const context = this;
    const args = arguments;

    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = window.setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

export default debounce;
