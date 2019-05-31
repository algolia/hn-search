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
    setSettings,
    fetchPopularStories,
    starred
  } = React.useContext(SearchContext);

  const onSearch = React.useCallback(
    (event: React.SyntheticEvent<HTMLInputElement>) => {
      const query = event.currentTarget.value;
      syncUrl({ ...settings, query });
      setSettings({ query });

      if (location.pathname === "/hot") {
        fetchPopularStories();
        return;
      } else if (location.pathname === "/starred") {
        search(query, settings, Array.from(starred.data));
        return;
      }

      search(query);
    },
    [settings]
  );

  React.useEffect(() => {
    if (location.pathname === "/hot") {
      fetchPopularStories();
      return;
    } else if (location.pathname === "/starred") {
      search(settings.query, settings, Array.from(starred.data));
      return;
    }

    search(settings.query);
  }, [settings, location.pathname]);

  return (
    <>
      <div className="SearchHeader_container">
        <span className="SearchIcon">
          <Search />
        </span>
        <input
          type="search"
          value={settings.query}
          onChange={onSearch}
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
