import * as React from "react";

import SearchHeader from "../components/SearchHeader/SearchHeader";
import Footer from "../components/Footer/Footer";

const SearchView: React.FunctionComponent = () => {
  return (
    <div className="container">
      <SearchHeader />
      <Footer />
    </div>
  );
};

export default SearchView;
