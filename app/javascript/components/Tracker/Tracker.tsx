import * as React from "react";
import * as ReactGA from "react-ga";
import { RouteComponentProps } from "react-router-dom";

ReactGA.initialize("UA-32446386-3");

const Tracker: React.FC<RouteComponentProps> = props => {
  const trackPage = (page: string) => {
    ReactGA.set({ page });
    ReactGA.pageview(page);
  };

  React.useEffect(() => {
    trackPage(props.location.pathname);
  }, [props.location.pathname]);

  return props.children;
};

export default Tracker;
