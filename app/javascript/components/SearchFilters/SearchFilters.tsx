import * as React from "react";
import * as moment from "moment";

import "./SearchFilters.scss";

import ChevronsRight from "react-feather/dist/icons/chevron-right";

import Dropdown from "../Dropdown/Dropdown";
import Datepicker from "../Datepicker/Datepicker";
import pluralize from "../../utils/pluralize";
import { SearchContext } from "../../providers/SearchProvider";
import { HNSettings } from "../../providers/Search.types";
import SocialShare from "../SocialShare/SocialShare";

export const STORY_FILTERS = new Map<HNSettings["type"], string>([
  ["all", "All"],
  ["story", "Stories"],
  ["comment", "Comments"]
]);

export const SORT_FILTERS = new Map<HNSettings["defaultSort"], string>([
  ["byPopularity", "Popularity"],
  ["byDate", "Date"]
]);

export const TIME_FILTERS = new Map<HNSettings["defaultDateRange"], string>([
  ["all", "All time"],
  ["last24h", "Last 24h"],
  ["pastWeek", "Past Week"],
  ["pastMonth", "Past Month"],
  ["pastYear", "Past Year"],
  ["custom", "Custom range"]
]);

const asItem = ([value, label]) => ({ value, label });
const formatDate = (date: string): string =>
  moment(parseInt(date) * 1000).format("MMMM Do YYYY");

const formatTimeFilters: React.FunctionComponent<{ settings: HNSettings }> = ({
  settings
}) => {
  if (
    settings.dateRange === "custom" &&
    settings.dateEnd &&
    settings.dateStart
  ) {
    return (
      <>
        {formatDate(settings.dateStart)}
        <ChevronsRight />
        {formatDate(settings.dateEnd)}
      </>
    );
  }

  return <>{TIME_FILTERS.get(settings.dateRange)}</>;
};

const SearchFilters: React.FunctionComponent = () => {
  const { results, settings, setSettings } = React.useContext(SearchContext);
  const forceOpen =
    settings.dateRange === "custom" && !settings.dateEnd && !settings.dateStart;
  const [isOpen, toggleOpen] = React.useState(forceOpen);

  return (
    <div className="SearchFilters container">
      <div className="SearchFilters_filters">
        <span className="SearchFilters_filterContainer">
          <span className="SearchFilters_text">Search</span>
          <Dropdown
            items={Array.from(STORY_FILTERS).map(asItem)}
            onChange={item =>
              setSettings({ type: item.value as HNSettings["type"] })
            }
            selectedItem={{
              value: settings.type,
              label: STORY_FILTERS.get(settings.type)
            }}
          />
        </span>
        <span className="SearchFilters_filterContainer">
          <span className="SearchFilters_text">by</span>
          <Dropdown
            items={Array.from(SORT_FILTERS).map(asItem)}
            onChange={item =>
              setSettings({ sort: item.value as HNSettings["sort"] })
            }
            selectedItem={{
              value: settings.sort,
              label: SORT_FILTERS.get(settings.sort)
            }}
          />
        </span>
        <span className="SearchFilters_filterContainer">
          <span className="SearchFilters_text">for</span>
          <Dropdown
            items={Array.from(TIME_FILTERS).map(asItem)}
            onChange={item => {
              if (item.value === "custom") {
                toggleOpen(true);
              }
              setSettings({
                dateRange: item.value as HNSettings["dateRange"]
              });
            }}
            selectedItem={{
              value: settings.dateRange,
              label: formatTimeFilters({ settings })
            }}
          />
          <Datepicker
            isOpen={isOpen}
            onCancel={() => toggleOpen(false)}
            onChange={(from: Date, to: Date) => {
              setSettings({
                dateStart: String(Math.round(from.getTime() / 1000)),
                dateEnd: String(Math.round(to.getTime() / 1000))
              });
            }}
            onBlur={() => toggleOpen(false)}
          />
        </span>
      </div>
      <div className="SearchFilters_meta">
        <p>
          {Number(results.nbHits).toLocaleString()}{" "}
          {pluralize(results.nbHits, "result")} (
          {results.processingTimeMS / 1000} seconds)
        </p>
        <SocialShare query={settings.query} />
      </div>
    </div>
  );
};

export default SearchFilters;
