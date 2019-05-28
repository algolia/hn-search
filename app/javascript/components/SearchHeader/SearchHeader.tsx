import * as React from "react";
import "./SearchHeader.scss";
import { Search, Settings } from "react-feather";
import { Link } from "react-router-dom";

import { SearchContext } from "../../providers/SearchProvider";
import AlgoliaLogoWhite from "images/algolia-logo-white.svg";
import AlgoliaLogoBlue from "images/algolia-logo-master.svg";

const POWERED_BY_LINK =
  "https://www.algolia.com/?utm_source=hn_search&amp;utm_medium=link&amp;utm_term=logo&amp;utm_campaign=hn_algolia";

const AlgoliaLogo: React.FunctionComponent = () => {
  const {
    settings: { style }
  } = React.useContext(SearchContext);
  const logoSrc = style === "default" ? AlgoliaLogoWhite : AlgoliaLogoBlue;
  return <img src={logoSrc} alt="Algolia" />;
};

const SearchHeader: React.FunctionComponent = () => {
  const {
    settings,
    search,
    syncUrl,
    fetchPopularStories,
    starred
  } = React.useContext(SearchContext);

  React.useEffect(() => {
    if (location.pathname === "/hot") {
      fetchPopularStories();
      return;
    } else if (location.pathname === "/starred") {
      search(settings.query, settings, Array.from(starred.data));
      return;
    }

    search(settings.query);
    // syncUrl(settings);
  }, [settings, location.pathname]);

  return (
    <>
      <div className="SearchHeader_container">
        <span className="SearchIcon">
          <Search />
        </span>
        <input
          type="search"
          defaultValue={settings.query}
          onInput={(event: React.SyntheticEvent<HTMLInputElement>) => {
            syncUrl({ ...settings, query: event.currentTarget.value });
            search(event.currentTarget.value);
          }}
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
          <AlgoliaLogo />
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
