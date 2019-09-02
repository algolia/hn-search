import "core-js/stable";
import "whatwg-fetch";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { Helmet } from "react-helmet";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import classnames from "classnames";
import "./../src/application.scss";

import SearchProvider, { SearchContext } from "../providers/SearchProvider";

const About = React.lazy(() => import("../views/About"));
const Api = React.lazy(() => import("../views/Api"));
const CoolApps = React.lazy(() => import("../views/CoolApps"));
const Help = React.lazy(() => import("../views/Help"));
const Search = React.lazy(() => import("../views/Search"));
const Settings = React.lazy(() => import("../views/Settings"));

import * as Telemetry from "../utils/telemetry";

window.addEventListener("load", () => {
  (window as any).Sentry.init({
    dsn: "https://f13a43fa91884c6fae60762be4dfb6f5@sentry.io/1520033"
  });
});

const ThemeClass: React.FunctionComponent = ({ children }) => {
  const {
    settings: { style, theme }
  } = React.useContext(SearchContext);

  return <div className={classnames(style, theme)}>{children}</div>;
};

const App = () => {
  return (
    <Router>
      <React.Suspense fallback={null}>
        <SearchProvider>
          <Helmet>
            <title>HN Search powered by Algolia</title>
          </Helmet>
          <ThemeClass>
            <Switch>
              <Route exact path="/settings" component={Settings} />
              <Route path="/about" component={About} />
              <Route path="/api" component={Api} />
              <Route path="/cool_apps" component={CoolApps} />
              <Route path="/help" component={Help} />
              <Route path="/story/:story_id" component={Search} />
              <Route path="/:path?" component={Search} />
            </Switch>
          </ThemeClass>
        </SearchProvider>
      </React.Suspense>
    </Router>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));
