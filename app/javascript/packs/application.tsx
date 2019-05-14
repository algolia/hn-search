import * as React from "react";
import * as ReactDOM from "react-dom";

class App extends React.Component {
  render() {
    return <p>I am an app</p>;
  }
}

ReactDOM.render(<App />, document.querySelector("#root"));
