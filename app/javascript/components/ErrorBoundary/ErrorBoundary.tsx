import * as React from "react";

class ErrorBoundary extends React.Component {
  state = { error: null };

  componentDidCatch(error, errorInfo) {
    this.setState({ error });
    if (window["Raven"]) {
      window["Raven"].captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="ErrorBoundary">
        <div className="ErrorBoundary_content">
          <h3>We're sorry — something's gone wrong.</h3>
          <p>
            Our team has been notified and will look into resolving this issue!
          </p>
          <a href="https://hn.algolia.com">Go back to home page</a>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
