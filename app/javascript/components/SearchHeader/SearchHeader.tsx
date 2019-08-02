import * as React from "react";
import { Link } from "react-router-dom";
import "./SearchHeader.scss";

import Search from "react-feather/dist/icons/search";
import Settings from "react-feather/dist/icons/settings";

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

const isEnterKeyPress = (
  event: React.KeyboardEvent<HTMLInputElement>
): boolean => {
  return event.keyCode === 13 || event.which === 13;
};

interface SearchHeaderProps {
  storyID?: string;
}

const SearchHeader: React.FunctionComponent<SearchHeaderProps> = ({
  storyID
}) => {
  const {
    settings,
    search,
    setSettings,
    fetchCommentsForStory,
    fetchPopularStories,
    starred
  } = React.useContext(SearchContext);

  const onSearch = React.useCallback(
    (event: React.SyntheticEvent<HTMLInputElement>) => {
      const query = event.currentTarget.value;
      setSettings({ query, prefix: true, page: 0 });
    },
    [settings]
  );

  const onPrefixNoneSearch = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const isEnter = isEnterKeyPress(event);
      if (!isEnter) return;

      setSettings({
        prefix: false
      });
    },
    [settings]
  );

  React.useEffect(() => {
    if (location.pathname.startsWith("/hot")) {
      fetchPopularStories();
      return;
    } else if (location.pathname.startsWith("/starred")) {
      search(settings.query, settings, Array.from(starred.data));
      return;
    } else if (location.pathname.startsWith("/story")) {
      search(settings.query, settings, [parseInt(storyID)]).then(() => {
        fetchCommentsForStory(storyID);
      });
      return;
    }

    search(settings.query, settings);
    return;
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
          onKeyUp={onPrefixNoneSearch}
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
