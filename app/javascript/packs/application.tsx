import * as React from "react";
import * as ReactDOM from "react-dom";

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
        <ThemeClass>
          <Route exact path="/" component={SearchView} />
          <Route path="/settings" component={Settings} />
        </ThemeClass>
      </SearchProvider>
    </Router>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));
