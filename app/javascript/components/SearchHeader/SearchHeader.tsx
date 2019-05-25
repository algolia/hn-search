import * as React from "react";
import "./SearchHeader.scss";
import { Search, Settings } from "react-feather";
import { Link } from "react-router-dom";

import { SearchContext } from "../../providers/SearchProvider";
import AlgoliaWhiteLogo from "images/algolia-logo-white.svg";

const POWERED_BY_LINK =
  "https://www.algolia.com/?utm_source=hn_search&amp;utm_medium=link&amp;utm_term=logo&amp;utm_campaign=hn_algolia";

const SearchHeader: React.FunctionComponent = () => {
  const { settings, search } = React.useContext(SearchContext);

  return (
    <>
      <div className="SearchHeader_container">
        <span className="SearchIcon">
          <Search />
        </span>
        <input
          type="search"
          defaultValue={settings.query}
          onInput={(event: React.SyntheticEvent<HTMLInputElement>) =>
            search(event.currentTarget.value)
          }
          placeholder="Search stories by title, url or author"
          className="SearchInput"
        />
      </div>
      <div className="PoweredBy">
        by
        <a
          href={POWERED_BY_LINK}
          title="Realtime Search Engine"
          target="_blank"
        >
          <img src={AlgoliaWhiteLogo} alt="Algolia logo white" />
        </a>
      </div>
      <div className="SearchHeader_settings">
        <Link to="/settings">
          <Settings />
        </Link>
      </div>
    </>
  );
};

export default SearchHeader;
