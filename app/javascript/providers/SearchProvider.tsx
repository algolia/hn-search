import * as React from "react";
import algoliasearch from "algoliasearch";
import { createBrowserHistory } from "history";

import { AlgoliaResults, HNSettings } from "./Search.types";
import getSearchSettings from "./SearchSettings";
import { initializeSettings, asQueryString, saveSettings } from "./Settings";

const history = createBrowserHistory();

interface ISearchContext {
  results: AlgoliaResults;
  loading: boolean;
  search: (query: string) => Promise<AlgoliaResults>;
  setSettings: (settings: Partial<HNSettings>) => HNSettings;
  settings: HNSettings;
}

export const DEFAULT_HN_SETTINGS: HNSettings = {
  showThumbnails: true,
  type: "story",
  defaultType: "story",
  sort: "byPopularity",
  defaultSort: "byPopularity",
  dateRange: "all",
  defaultDateRange: "all",
  style: "default",
  typoTolerance: true,
  storyText: true,
  authorText: true,
  hitsPerPage: 20,
  page: 0,
  prefix: false
};

const DEFAULT_SEARCH_STATE = {
  results: {
    hits: [],
    query: "",
    nbHits: 0,
    processingTimeMS: 0,
    nbPages: 0
  },
  loading: false,
  settings: DEFAULT_HN_SETTINGS
};

class SearchProvider extends React.Component {
  client = algoliasearch("UJ5WYC0L7X", "8ece23f8eb07cd25d40262a1764599b1");
  indexUser = (this.client as any).initIndex("User_production");
  indexSortedByPopularity = (this.client as any).initIndex("Item_production");
  indexSortedByDate = (this.client as any).initIndex(
    "Item_production_sort_date"
  );
  indexSortedByPopularityOrdered = (this.client as any).initIndex(
    "Item_production_ordered"
  );

  state = DEFAULT_SEARCH_STATE;

  componentDidMount() {
    const settings = initializeSettings();

    this.setSettings(settings);
  }

  reset = () => {
    this.setSettings({
      page: 0,
      sort: DEFAULT_HN_SETTINGS.defaultSort,
      type: DEFAULT_HN_SETTINGS.defaultType,
      defaultDateRange: DEFAULT_HN_SETTINGS.defaultDateRange
    });

    // Analytics.trackEvent('settings', 'style', settings.style);
    // Analytics.trackEvent('settings', 'defaultType', settings.defaultType);
    // Analytics.trackEvent('settings', 'defaultSort', settings.defaultSort);
    // Analytics.trackEvent('settings', 'defaultDateRange', settings.defaultDateRange);
  };

  getIndex = (query: string) => {
    const settings = this.state.settings;

    if (settings.sort === "byDate") return this.indexSortedByDate;
    else if (query.length <= 2) return this.indexSortedByPopularityOrdered;
    return this.indexSortedByPopularity;
  };

  setSettings = (settings: Partial<HNSettings>) => {
    const newSettings: HNSettings = { ...this.state.settings, ...settings };
    this.setState({ settings: newSettings }, () => {
      this.search("", newSettings);
      saveSettings(newSettings);
    });
    history.replace(`?${asQueryString(newSettings)}`);

    return newSettings;
  };

  search = (
    query: string = "",
    settings: HNSettings = this.state.settings
  ): Promise<AlgoliaResults> => {
    this.setState({ loading: true });

    const params = getSearchSettings(settings);

    return this.getIndex(query)
      .search(query, params)
      .then((results: AlgoliaResults) => {
        if (results.query !== query) return;

        this.setState({
          results,
          loading: false
        });
      });
  };

  render() {
    return (
      <SearchContext.Provider
        value={{
          ...this.state,
          search: this.search,
          setSettings: this.setSettings
        }}
      >
        {this.props.children}
      </SearchContext.Provider>
    );
  }
}

export const SearchContext = React.createContext<ISearchContext>({
  results: {
    hits: [],
    query: "",
    nbHits: 0,
    processingTimeMS: 0,
    nbPages: 0
  },
  loading: false,
  settings: DEFAULT_HN_SETTINGS,
  setSettings: (data: Partial<HNSettings>) => DEFAULT_HN_SETTINGS,
  search: (query: string) => new Promise<AlgoliaResults>(resolve => resolve())
});

export default SearchProvider;
