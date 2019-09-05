import * as ReactGA from "react-ga";

const isKey = (event: KeyboardEvent, key: string, keyCode: number) => {
  if (event.key) return event.key === key;
  return event.keyCode === keyCode || event.which === keyCode;
};
const isShiftKey = (event: KeyboardEvent) => event.shiftKey;
const isCMDKey = (event: KeyboardEvent) => event.metaKey;

enum KeyCodes {
  enter = 13,
  k = 75
}

const isShiftCMDK = (event: KeyboardEvent) =>
  isKey(event, "k", KeyCodes.k) && isShiftKey(event) && isCMDKey(event);

const shiftCMDKHandler = (event: KeyboardEvent) => {
  if (!isShiftCMDK(event)) return;

  ReactGA.event({
    category: "search",
    action: "shiftCMDKey"
  });
};

const trackCMDK = () => {
  document.addEventListener("keydown", shiftCMDKHandler);
  return () => window.removeEventListener("keydown", shiftCMDKHandler);
};

export default trackCMDK;
