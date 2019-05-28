import * as React from "react";
import { Helmet } from "react-helmet";
import { RouteComponentProps } from "react-router";

import Header from "../components/Header/Header";
import SearchHeader from "../components/SearchHeader/SearchHeader";
import SearchResults from "../components/SearchResults/SearchResults";
import Sidebar from "../components/Sidebar/Sidebar";
import Pagination from "../components/Pagination/Pagination";
import Footer from "../components/Footer/Footer";

import SearchFilters from "../components/SearchFilters/SearchFilters";
import { SearchContext } from "../providers/SearchProvider";
import { SidebarItems } from "../components/Sidebar/Sidebar";

const SearchView: React.FunctionComponent<RouteComponentProps> = props => {
  const {
    settings: { style }
  } = React.useContext(SearchContext);

  const knownTitle = SidebarItems.find(
    item => item.to === props.location.pathname
  );
  const title = knownTitle
    ? `${knownTitle.label} | Search powered by Algolia`
    : "HN Search powered by Algolia";

  return (
    <div className="container">
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Header>
        <SearchHeader />
      </Header>
      <SearchFilters />
      <SearchResults />
      {style === "experimental" && <Sidebar {...props} />}
      <Pagination />
      <Footer />
    </div>
  );
};

export default SearchView;
