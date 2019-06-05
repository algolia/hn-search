import * as React from "react";
import { Helmet } from "react-helmet";
import { RouteComponentProps } from "react-router";

import Tracker from "../components/Tracker/Tracker";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

const Api: React.FunctionComponent<RouteComponentProps> = props => {
  return (
    <Tracker {...props}>
      <div className="container">
        <Helmet>
          <title>Api</title>
        </Helmet>
        <Header />
        <Footer />
      </div>
    </Tracker>
  );
};

export default Api;
