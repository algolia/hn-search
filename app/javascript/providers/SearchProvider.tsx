import * as React from "react";
import algoliasearch from "algoliasearch";
import { AlgoliaResults, SearchSettings } from "./Search.types";
import { initSettings } from "./Settings";

interface ISearchContext {
  results: AlgoliaResults;
  loading: boolean;
  search: (query: string) => Promise<AlgoliaResults>;
  setSettings: (settings: Partial<SearchSettings>) => SearchSettings;
  settings: SearchSettings;
}

export const DEFAULT_SEARCH_SETTINGS: SearchSettings = {
  showThumbnails: true,
  type: "stories",
  defaultType: "stories",
  sort: "byPopularity",
  defaultSort: "byPopularity",
  defaultDateRange: "all",
  style: "default",
  typoTolerance: true,
  storyText: true,
  authorText: true,
  hitsPerPage: 20,
  page: 0
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
  settings: DEFAULT_SEARCH_SETTINGS
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
    initSettings();
    this.search();
  }

  reset = () => {
    this.setSettings({
      page: 0,
      sort: DEFAULT_SEARCH_SETTINGS.defaultSort,
      type: DEFAULT_SEARCH_SETTINGS.defaultType,
      defaultDateRange: DEFAULT_SEARCH_SETTINGS.defaultDateRange
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

  setSettings = (settings: Partial<SearchSettings>) => {
    const newSettings: SearchSettings = { ...this.state.settings, ...settings };
    this.setState({ settings: newSettings });

    return newSettings;
  };

  search = (query: string = ""): Promise<AlgoliaResults> => {
    this.setState({ loading: true });

    return this.getIndex(query)
      .search(query, { page: this.state.settings.page })
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
  settings: DEFAULT_SEARCH_SETTINGS,
  setSettings: (data: Partial<SearchSettings>) => DEFAULT_SEARCH_SETTINGS,
  search: (query: string) => new Promise<AlgoliaResults>(resolve => resolve())
});

export default SearchProvider;
