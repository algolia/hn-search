import * as React from "react";
import { useEffect } from "react";

const useIntersectionObserver = (
  ref: React.MutableRefObject<HTMLElement>,
  config: IntersectionObserverInit
) => {
  const [isIntersecting, setIntersecting] = React.useState(false);

  useEffect(() => {
    if (('IntersectionObserver' in window) === false) {
      setIntersecting(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
    }, config);

    if (ref.current) observer.observe(ref.current);

    return () => {
      observer.unobserve(ref.current);
    };
  }, []);

  return isIntersecting;
};

export default useIntersectionObserver;
