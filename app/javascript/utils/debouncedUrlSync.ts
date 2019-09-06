import { createBrowserHistory } from "history";

import debounce from "./debounce";
import { asQueryString } from "../providers/Settings";
import { HNSettings } from "../providers/Search.types";

const history = createBrowserHistory();

const debouncedUrlSync = debounce(
  (settings: HNSettings) => {
    if ("requestIdleCallback" in (window as any)) {
      return window["requestIdleCallback"](() => {
        history.push({
          pathname: window.location.pathname,
          search: asQueryString(settings)
        });
      });
    }

    return history.push({
      pathname: window.location.pathname,
      search: asQueryString(settings)
    });
  },
  500,
  false
);

export default debouncedUrlSync;
