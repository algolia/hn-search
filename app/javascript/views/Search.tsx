import * as React from "react";
import { RouteComponentProps } from "react-router";

import Header from "../components/Header/Header";
import SearchHeader from "../components/SearchHeader/SearchHeader";
import SearchResults from "../components/SearchResults/SearchResults";
import Pagination from "../components/Pagination/Pagination";
import Footer from "../components/Footer/Footer";

import SearchFilters from "../components/SearchFilters/SearchFilters";

const SearchView: React.FunctionComponent<RouteComponentProps> = () => {
  return (
    <div className="container">
      <Header>
        <SearchHeader />
      </Header>
      <SearchFilters />
      <SearchResults />
      <Pagination />
      <Footer />
    </div>
  );
};

export default SearchView;
