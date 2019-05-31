import * as React from "react";
import * as ReactGA from "react-ga";
import { RouteComponentProps } from "react-router-dom";

ReactGA.initialize("UA-32446386-3");

const Tracker = <P extends RouteComponentProps>(
  WrappedComponent: React.ComponentType<P>,
  options: ReactGA.FieldsObject = {}
) => {
  const trackPage = (page: string) => {
    ReactGA.set({ page, ...options });
    ReactGA.pageview(page);
  };

  return (props: P) => {
    React.useEffect(() => {
      trackPage(props.location.pathname);
    }, [props.location.pathname]);

    return <WrappedComponent {...props} />;
  };
};

export default Tracker;
