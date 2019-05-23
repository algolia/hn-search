import * as React from "react";
import * as ReactDOM from "react-dom";

import "./../src/application";
import SearchView from "../views/Search";

import { BrowserRouter as Router, Route } from "react-router-dom";
import Settings from "../views/Settings";
import SearchProvider from "../providers/SearchProvider";

const App = () => {
  return (
    <Router>
      <SearchProvider>
        <Route exact path="/" component={SearchView} />
        <Route path="/settings" component={Settings} />
      </SearchProvider>
    </Router>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));
