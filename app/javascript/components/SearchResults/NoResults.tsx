import * as React from "react";
import "./NoResults.scss";

import { SearchContext, PopularSearches } from "../../providers/SearchProvider";
import { HNSettings } from "../../providers/Search.types";

const getItemsLabel = (type: HNSettings["type"]): string => {
  switch (type) {
    case "story":
      return "stories";
    case "comment":
      return "comments";
    default:
      return "items";
  }
};

const PopularSearches: React.FunctionComponent<{
  searches: PopularSearches;
  onSearchClick: (query: string) => any;
}> = ({ searches, onSearchClick }) => {
  if (!searches.length) return null;

  return (
    <div className="NoResults_popular">
      <p>Or try popular queries:</p>
      {searches.map(({ search: query }) => (
        <a
          href="#"
          key={query}
          onClick={(e: React.SyntheticEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            onSearchClick(query);
          }}
        >
          {query}
        </a>
      ))}
    </div>
  );
};

const SettingsLink: React.FunctionComponent<{
  onClick: () => any;
}> = ({ onClick, children }) => {
  return (
    <div>
      <a
        href="#"
        onClick={e => {
          e.preventDefault();
          onClick();
        }}
      >
        {children}
      </a>
    </div>
  );
};

const NoResults: React.FunctionComponent = () => {
  const { settings, setSettings, popularSearches } = React.useContext(
    SearchContext
  );
  const showForPeriod = settings.dateRange !== "all";
  const showOtherSearch = settings.type !== "all";

  return (
    <div className="NoResults">
      <div>
        We found no <b>{getItemsLabel(settings.type)}</b> matching{" "}
        <b>{settings.query}</b> {showForPeriod && "for this period."}
        {showForPeriod && (
          <SettingsLink onClick={() => setSettings({ type: "all" })}>
            Try a wider date range
          </SettingsLink>
        )}
        {showOtherSearch && settings.type === "story" && (
          <SettingsLink onClick={() => setSettings({ type: "comment" })}>
            Search also for comments
          </SettingsLink>
        )}
        {showOtherSearch && settings.type === "comment" && (
          <SettingsLink onClick={() => setSettings({ type: "story" })}>
            Search also for stories
          </SettingsLink>
        )}
        <PopularSearches
          searches={popularSearches}
          onSearchClick={query => setSettings({ query })}
        />
      </div>
    </div>
  );
};

export default NoResults;
