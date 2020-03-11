import * as React from "react";
import { Helmet } from "react-helmet";
import { RouteComponentProps } from "react-router";

import Tracker from "../../components/Tracker/Tracker";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

interface LayoutProps extends RouteComponentProps {
  title: string;
}

const Layout: React.FC<LayoutProps> = props => {
  return (
    <Tracker {...props}>
      <div className="container">
        <Helmet>
          <title>{props.title} | HN Search powered by Algolia</title>
        </Helmet>
        <Header />
        <div className={`SearchFilters container SearchFilters-${props.title}`}>
          <p className="SearchFilters_settings">{props.title}</p>
        </div>
        <section className={`Layout Layout-${props.title}`}>
          {props.children}
        </section>
        <Footer />
      </div>
    </Tracker>
  );
};

export default Layout;
