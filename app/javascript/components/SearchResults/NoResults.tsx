import * as React from "react";

import { SearchContext } from "../../providers/SearchProvider";
import { HNSettings, PopularSearches } from "../../providers/Search.types";
import Star from "react-feather/dist/icons/star";

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

const PopularSearches: React.FC<{
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

const SettingsLink: React.FC<{
  onClick: () => any;
}> = ({ onClick, children }) => {
  return (
    <div>
      <a
        className="NoResults_changeSettings"
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

const NoResults: React.FC = () => {
  const { settings, setSettings, popularSearches, starred } = React.useContext(
    SearchContext
  );
  const showForPeriod = settings.dateRange !== "all";
  const showOtherSearch = settings.type !== "all";
  const showUsersQuery = location.pathname === "/user";

  if (location.pathname === "/starred") {
    if (!starred.data.size) {
      return (
        <div className="NoResults">
          <p>
            You have no starred items. To star items, click the{" "}
            <Star
              size={16}
              style={{
                transform: "translate(0, 2px)",
                fill: "currentColor"
              }}
            />{" "}
            icon on the right side of each story
          </p>
        </div>
      );
    }

    return (
      <div className="NoResults">
        <p>
          We could not find your starred items with ID's{" "}
          <b>
            {" "}
            {Array.from(starred.data)
              .map(id => id)
              .join(", ")}
          </b>
          .
        </p>
      </div>
    );
  }
  return (
    <div className="NoResults">
      <div>
        {showUsersQuery ? (
          <>
            We found no results from profile <b>{settings.login}</b>
          </>
        ) : (
          <>
            We found no <b>{getItemsLabel(settings.type)}</b> matching{" "}
            <b>{settings.query || "your query"}</b>{" "}
            {showForPeriod && "for this period."}
          </>
        )}
        {(showForPeriod || settings.type !== "all") && (
          <p className="NoResults_suggestions">Suggestions:</p>
        )}
        {showForPeriod && (
          <SettingsLink onClick={() => setSettings({ dateRange: "all" })}>
            Search with a wider date range
          </SettingsLink>
        )}
        {showOtherSearch && settings.type === "story" && (
          <SettingsLink onClick={() => setSettings({ type: "comment" })}>
            Search for comments
          </SettingsLink>
        )}
        {showOtherSearch && settings.type === "comment" && (
          <SettingsLink onClick={() => setSettings({ type: "story" })}>
            Search for stories
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
