import * as React from "react";
import * as ReactDOM from "react-dom";
import { Helmet } from "react-helmet";

import "./../src/application.scss";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import SearchProvider from "../providers/SearchProvider";
import { SearchContext } from "../providers/SearchProvider";
import SearchView from "../views/Search";
import Settings from "../views/Settings";

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
            <Route path="/:path?" index component={SearchView} />
          </Switch>
        </ThemeClass>
      </SearchProvider>
    </Router>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));
