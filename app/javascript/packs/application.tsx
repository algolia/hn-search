import * as React from "react";
import * as ReactDOM from "react-dom";

import "./../src/application";

import SearchView from "../views/Search";

const App: React.FunctionComponent = () => {
  return <SearchView />;
};

ReactDOM.render(<App />, document.querySelector("#root"));
