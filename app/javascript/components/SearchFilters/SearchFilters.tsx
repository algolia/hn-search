import * as React from "react";
import { CSSTransition } from "react-transition-group";
import fromUnixTime from "date-fns/fromUnixTime";
import format from "date-fns/format";

import "./SearchFilters.scss";

import ChevronsRight from "react-feather/dist/icons/chevron-right";
import Menu from "react-feather/dist/icons/menu";

import Dropdown from "../Dropdown/Dropdown";
import Datepicker from "../Datepicker/index";
import ThemeSwitch from "../ThemeSwitch/ThemeSwitch";
import SocialShare from "../SocialShare/SocialShare";
import { DefaultLinks, StarredLinks } from "../Sidebar/Sidebar";
import { SearchContext } from "../../providers/SearchProvider";
import { HNSettings } from "../../providers/Search.types";
import pluralize from "../../utils/pluralize";
import useClickOutside from "../../utils/useClickOutside";

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
const formatDate = (date: string): string => {
  const unixDate = fromUnixTime(parseInt(date));
  return format(unixDate, "MMM do yyyy");
};

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

const SearchFiltersMenu: React.FC<{
  setMenu?: (value: boolean) => void;
}> = ({ setMenu }) => {
  const { settings } = React.useContext(SearchContext);
  const menuRef = React.useRef(null);

  useClickOutside(menuRef, e => {
    if (!e.currentTarget.classList.contains("SearchFilters_menuButton")) return;
    setMenu(false);
  });

  return (
    <CSSTransition
      appear={true}
      classNames="SearchMenuAnimation"
      in={true}
      timeout={0}
    >
      <div className="SearchFilters_menu" ref={menuRef}>
        <DefaultLinks setMenu={setMenu} />
        <StarredLinks setMenu={setMenu} user={settings.login} />
        <ul>
          <li className="SearchFilters_theme">
            <ThemeSwitch /> Theme
          </li>
        </ul>
      </div>
    </CSSTransition>
  );
};

const SearchFilters: React.FunctionComponent = () => {
  const { results, settings, setSettings } = React.useContext(SearchContext);
  const forceOpen =
    settings.dateRange === "custom" && !settings.dateEnd && !settings.dateStart;
  const [isOpen, setOpen] = React.useState(forceOpen);
  const [isOpenMenu, setMenu] = React.useState(false);

  return (
    <>
      <div className="SearchFilters container">
        <button
          className="SearchFilters_menuButton"
          onClick={() => setMenu(!isOpenMenu)}
        >
          <Menu size={14} />
        </button>
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
                  setOpen(true);
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
              onCancel={() => setOpen(false)}
              onChange={(from: Date, to: Date) => {
                setSettings({
                  dateStart: String(Math.round(from.getTime() / 1000)),
                  dateEnd: String(Math.round(to.getTime() / 1000))
                });
              }}
              onBlur={() => setOpen(false)}
            />
          </span>
        </div>
        <div className="SearchFilters_meta">
          <p className="SearchFilters_engineProcessingTime">
            {Number(results.nbHits).toLocaleString()}{" "}
            {pluralize(results.nbHits, "result")} (
            {results.processingTimeMS / 1000} seconds)
          </p>
          <SocialShare query={settings.query} />
        </div>
      </div>
      {isOpenMenu && <SearchFiltersMenu setMenu={setMenu} />}
    </>
  );
};

export default SearchFilters;
