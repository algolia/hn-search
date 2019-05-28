import * as React from "react";
import { RouteComponentProps } from "react-router";

import Header from "../components/Header/Header";
import SearchHeader from "../components/SearchHeader/SearchHeader";
import SearchResults from "../components/SearchResults/SearchResults";
import Sidebar from "../components/Sidebar/Sidebar";
import Pagination from "../components/Pagination/Pagination";
import Footer from "../components/Footer/Footer";

import SearchFilters from "../components/SearchFilters/SearchFilters";
import { SearchContext } from "../providers/SearchProvider";

const SearchView: React.FunctionComponent<RouteComponentProps> = props => {
  const {
    settings: { style }
  } = React.useContext(SearchContext);

  return (
    <div className="container">
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
