import * as React from "react";
import algoliasearch from "algoliasearch";
import { createBrowserHistory } from "history";

import Starred from "./Starred";
import {
  AlgoliaResults,
  Comment,
  HNSettings,
  Hit,
  PopularSearches
} from "./Search.types";
import { initializeSettings, asQueryString, saveSettings } from "./Settings";
import getSearchSettings from "./SearchSettings";
import { trackSettingsChanges } from "./Analytics";
import debounce from "../utils/debounce";

const history = createBrowserHistory();
const CSRFMeta: HTMLMetaElement = document.querySelector(
  'meta[name="csrf-token"]'
);
const REQUEST_HEADERS = new Headers({
  "X-CSRF-TOKEN": CSRFMeta.content
});

interface ISearchContext {
  results: AlgoliaResults;
  popularSearches: PopularSearches;
  popularStories: number[];
  loading: boolean;
  search: (
    query: string,
    settings?: HNSettings,
    storyIDs?: number[]
  ) => Promise<AlgoliaResults>;
  fetchPopularStories: () => Promise<AlgoliaResults>;
  fetchCommentsForStory: (objectID: Hit["objectID"]) => Promise<Comment>;
  setSettings: (settings: Partial<HNSettings>) => HNSettings;
  syncUrl: (settings: HNSettings) => any;
  settings: HNSettings;
  starred: Starred;
}

export const DEFAULT_HN_SETTINGS: HNSettings = {
  showThumbnails: true,
  type: "story",
  sort: "byPopularity",
  dateRange: "all",
  defaultType: "story",
  defaultSort: "byPopularity",
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
  loading: true,
  popularStories: [],
  popularSearches: [],
  settings: initializeSettings()
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

  starred = new Starred();
  state = DEFAULT_SEARCH_STATE;

  reset = () => {
    this.setSettings({
      page: 0,
      sort: DEFAULT_HN_SETTINGS.defaultSort,
      type: DEFAULT_HN_SETTINGS.defaultType,
      dateRange: DEFAULT_HN_SETTINGS.defaultDateRange
    });
  };

  getIndex = (query: string) => {
    const settings = this.state.settings;

    if (settings.sort === "byDate") return this.indexSortedByDate;
    else if (query.length <= 2) return this.indexSortedByPopularityOrdered;
    return this.indexSortedByPopularity;
  };

  setSettings = (settings: Partial<HNSettings>) => {
    const newSettings: HNSettings = { ...this.state.settings, ...settings };
    trackSettingsChanges(this.state.settings, newSettings);

    this.setState({ settings: newSettings }, () => {
      this.syncUrl(newSettings);
      saveSettings(newSettings);
    });

    return newSettings;
  };

  syncUrl = (settings: HNSettings) => {
    if ("requestIdleCallback" in (window as any)) {
      return window["requestIdleCallback"](() => {
        history.push({
          pathname: window.location.pathname,
          search: `${asQueryString(settings)}`
        });
      });
    }

    return history.push({
      pathname: window.location.pathname,
      search: `${asQueryString(this.state.settings)}`
    });
  };

  search = (
    query: string = "",
    settings: HNSettings = this.state.settings,
    storyIDs?: number[]
  ): Promise<AlgoliaResults> => {
    this.setState({ loading: true });
    const params = getSearchSettings(query, settings, storyIDs);

    return this.getIndex(params.query)
      .search(params)
      .then((results: AlgoliaResults) => {
        if (results.query !== params.query) return;
        if (!results.hits.length) {
          this.fetchPopularSearches().then(searches => {
            this.setState({ popularSearches: searches });
          });
        }

        this.setState({
          results,
          loading: false
        });
      });
  };

  fetchPopularStories = (): Promise<AlgoliaResults> => {
    const { settings } = this.state;

    if (this.state.popularStories.length) {
      return this.search(settings.query, settings, this.state.popularStories);
    }

    return fetch("https://hacker-news.firebaseio.com/v0/topstories.json")
      .then(resp => resp.json())
      .then((storyIDs: number[]) => {
        this.setState({
          popularStories: storyIDs
        });
        return this.search(settings.query, settings, storyIDs);
      });
  };

  fetchPopularSearches = (): Promise<PopularSearches> => {
    return fetch("/popular.json", {
      headers: REQUEST_HEADERS
    }).then(resp => resp.json());
  };

  fetchCommentsForStory = (objectID: Hit["objectID"]): Promise<Comment> => {
    return fetch(`https://hn.algolia.com/api/v1/items/${objectID}`, {
      // headers: REQUEST_HEADERS
    })
      .then(resp => resp.json())
      .then(comments => {
        const hitsWithComments: AlgoliaResults["hits"] = this.state.results.hits.map(
          hit => {
            if (hit.objectID !== objectID) return hit;
            return {
              ...hit,
              comments: comments
            };
          }
        );

        this.setState({
          results: {
            ...this.state.results,
            hits: hitsWithComments
          }
        });
        return comments;
      });
  };

  render() {
    return (
      <SearchContext.Provider
        value={{
          ...this.state,
          search: this.search,
          fetchPopularStories: this.fetchPopularStories,
          fetchCommentsForStory: this.fetchCommentsForStory,
          setSettings: this.setSettings,
          starred: this.starred,
          syncUrl: this.syncUrl
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
  loading: true,
  popularStories: [],
  popularSearches: [],
  starred: new Starred(),
  settings: DEFAULT_HN_SETTINGS,
  setSettings: (settings: Partial<HNSettings>) => DEFAULT_HN_SETTINGS,
  syncUrl: (settings: HNSettings) => null,
  search: (query: string) => new Promise<AlgoliaResults>(resolve => resolve()),
  fetchPopularStories: () => new Promise<AlgoliaResults>(resolve => resolve()),
  fetchCommentsForStory: (objectID: Hit["objectID"]) =>
    new Promise<Comment>(resolve => resolve())
});

export default SearchProvider;
