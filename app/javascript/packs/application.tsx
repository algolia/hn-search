import * as React from "react";
import * as ReactDOM from "react-dom";
import { Helmet } from "react-helmet";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import "./../src/application.scss";

import SearchProvider, { SearchContext } from "../providers/SearchProvider";

import About from "../views/About";
import Api from "../views/Api";
import CoolApps from "../views/CoolApps";
import Help from "../views/Help";
import Search from "../views/Search";
import Settings from "../views/Settings";

import * from './../utils/telemetry';

const ThemeClass: React.FunctionComponent = ({ children }) => {
  const {
    settings: { style }
  } = React.useContext(SearchContext);

  return <div className={style}>{children}</div>;
};

const App = () => {
  return (
    <Router>
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
    </Router>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));
