import * as React from "react";
import "./SearchFilters.scss";

import { Share2 } from "react-feather";

const SearchFilters: React.FunctionComponent = () => {
  return (
    <div className="SearchFilters">
      <div className="SearchFilters_filters">
        <span className="SearchFilters_filterContainer">Search</span>
        <span className="SearchFilters_filterContainer">by</span>
        <span className="SearchFilters_filterContainer">for</span>
      </div>
      <div className="SearchFilters_meta">
        <p>17,970,788 results (0.007 seconds)</p>
        <a href="/settings">
          <Share2 />
        </a>
      </div>
    </div>
  );
};

export default SearchFilters;
