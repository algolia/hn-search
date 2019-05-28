import * as React from "react";
import * as ReactDOM from "react-dom";
import { Helmet } from "react-helmet";

import "./../src/application.scss";
import SearchView from "../views/Search";

import { BrowserRouter as Router, Route } from "react-router-dom";
import Settings from "../views/Settings";
import SearchProvider from "../providers/SearchProvider";
import { SearchContext } from "../providers/SearchProvider";

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
          <Route path="/:path?" index component={SearchView} />
          <Route exact path="/settings" component={Settings} />
        </ThemeClass>
      </SearchProvider>
    </Router>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));
