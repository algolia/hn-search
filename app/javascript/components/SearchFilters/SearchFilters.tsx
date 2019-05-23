import * as React from "react";
import "./SearchFilters.scss";

import { Share2 } from "react-feather";
import Dropdown from "../Dropdown/Dropdown";

import pluralize from "../../utils/pluralize";
import { SearchContext } from "../../providers/SearchProvider";
import { SearchSettings } from "../../providers/Search.types";

export const STORY_FILTERS = new Map<SearchSettings["type"], string>([
  ["all", "All"],
  ["stories", "Stories"],
  ["comments", "Comments"]
]);

export const SORT_FILTERS = new Map<SearchSettings["defaultSort"], string>([
  ["byPopularity", "Popularity"],
  ["byDate", "Date"]
]);

export const TIME_FILTERS = new Map<SearchSettings["defaultDateRange"], string>(
  [
    ["all", "All time"],
    ["last24h", "Last 24h"],
    ["pastWeek", "Past Week"],
    ["pastMonth", "Past Month"],
    ["pastYear", "Past Year"],
    ["custom", "Custom range"]
  ]
);

const asItem = ([value, label]) => ({ value, label });

const SearchFilters: React.FunctionComponent = () => {
  const { results, settings, setSettings } = React.useContext(SearchContext);

  return (
    <div className="SearchFilters container">
      <div className="SearchFilters_filters">
        <span className="SearchFilters_filterContainer">
          Search{" "}
          <Dropdown
            items={Array.from(STORY_FILTERS).map(asItem)}
            onChange={item =>
              setSettings({ type: item.value as SearchSettings["type"] })
            }
            selectedItem={{
              value: settings.type,
              label: STORY_FILTERS.get(settings.type)
            }}
          />
        </span>
        <span className="SearchFilters_filterContainer">
          by
          <Dropdown
            items={Array.from(SORT_FILTERS).map(asItem)}
            onChange={item =>
              setSettings({ sort: item.value as SearchSettings["sort"] })
            }
            selectedItem={{
              value: settings.sort,
              label: SORT_FILTERS.get(settings.sort)
            }}
          />
        </span>
        <span className="SearchFilters_filterContainer">
          for
          <Dropdown
            items={Array.from(TIME_FILTERS).map(asItem)}
            onChange={item =>
              setSettings({
                defaultDateRange: item.value as SearchSettings["defaultDateRange"]
              })
            }
            selectedItem={{
              value: settings.defaultDateRange,
              label: TIME_FILTERS.get(settings.defaultDateRange)
            }}
          />
        </span>
      </div>
      <div className="SearchFilters_meta">
        <p>
          {Number(results.nbHits).toLocaleString()}{" "}
          {pluralize(results.nbHits, "result")} (
          {results.processingTimeMS / 1000} seconds)
        </p>
        <a href="/settings">
          <Share2 />
        </a>
      </div>
    </div>
  );
};

export default SearchFilters;
