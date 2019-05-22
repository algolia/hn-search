import * as React from "react";
import "./SearchHeader.scss";

import { Search, Settings } from "react-feather";
import SearchFilters from "../SearchFilters/SearchFilters";

import HNSearchLogo from "images/logo-hn-search.png";
import AlgoliaWhiteLogo from "images/algolia-logo-white.svg";

const POWERED_BY_LINK =
  "https://www.algolia.com/?utm_source=hn_search&amp;utm_medium=link&amp;utm_term=logo&amp;utm_campaign=hn_algolia";

const SearchHeader: React.FunctionComponent = () => {
  return (
    <header className="SearchHeader container">
      <div className="SearchHeader_search">
        <a
          className="SearchHeader_logo"
          ng-click="reset()"
          ng-href="/?"
          href="/?"
        >
          <img src={HNSearchLogo} />
          <div className="SearchHeader_label">
            Search
            <br />
            Hacker News
          </div>
        </a>
        <div className="SearchHeader_container">
          <span className="SearchIcon">
            <Search />
          </span>
          <input
            type="search"
            placeholder="Search stories by title, url or author"
            className="SearchInput"
          />
        </div>
        <div className="PoweredBy">
          by
          <a href={POWERED_BY_LINK} title="Realtime Search Engine">
            <img src={AlgoliaWhiteLogo} alt="Algolia logo white" />
          </a>
        </div>
        <div className="SearchHeader_settings">
          <a href="/settings">
            <Settings />
          </a>
        </div>
      </div>
      <SearchFilters />
    </header>
  );
};

export default SearchHeader;
