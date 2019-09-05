import * as React from "react";

const useClickOutside = (
  ref: React.RefObject<any>,
  callback: (e?: React.MouseEvent<HTMLElement>) => void
) => {
  /**
   * Alert if clicked on outside of element
   */
  const handleClickOutside = event => {
    if (ref.current && !ref.current.contains(event.target)) {
      callback();
    }
  };

  React.useEffect(() => {
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });
};

export default useClickOutside;
