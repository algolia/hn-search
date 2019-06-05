import * as React from "react";
import { Helmet } from "react-helmet";
import { RouteComponentProps } from "react-router";

import Tracker from "../components/Tracker/Tracker";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

const CoolApps: React.FunctionComponent<RouteComponentProps> = props => {
  return (
    <Tracker {...props}>
      <div className="container">
        <Helmet>
          <title>Cool Apps</title>
        </Helmet>
        <Header />
        <Footer />
      </div>
    </Tracker>
  );
};

export default CoolApps;
