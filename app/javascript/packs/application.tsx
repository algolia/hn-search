import "core-js/stable/array/find";
import "core-js/stable/array/from";
import "core-js/stable/array/includes";
import "core-js/stable/array/fill";

import "core-js/stable/promise";
import "core-js/stable/string/starts-with";
import "core-js/stable/object/assign";

import "whatwg-fetch";
import "../utils/telemetry";

import * as React from "react";
import * as ReactDOM from "react-dom";
import classnames from "classnames";
import { Helmet } from "react-helmet";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import "./../src/application.scss";

import SearchProvider, { SearchContext } from "../providers/SearchProvider";
import ErrorBoundary from "../components/ErrorBoundary/ErrorBoundary";

const About = React.lazy(() => import("../views/About"));
const Api = React.lazy(() => import("../views/Api"));
const CoolApps = React.lazy(() => import("../views/CoolApps"));
const Help = React.lazy(() => import("../views/Help"));
const Search = React.lazy(() => import("../views/Search"));
const Settings = React.lazy(() => import("../views/Settings"));

const ThemeClass: React.FunctionComponent = ({ children }) => {
  const {
    settings: { style, theme }
  } = React.useContext(SearchContext);

  return <div className={classnames(style, theme)}>{children}</div>;
};

const App: React.FC = () => (
  <ErrorBoundary>
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
  </ErrorBoundary>
);

ReactDOM.render(<App />, document.querySelector("#root"));
