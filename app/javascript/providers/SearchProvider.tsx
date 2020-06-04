import * as React from "react";
import { SearchResponse } from "@algolia/client-search";
import algoliasearch, { SearchClient, SearchIndex } from "algoliasearch/lite";
import { createBrowserXhrRequester } from "@algolia/requester-browser-xhr";
import createTelemetryClient from "@algolia/algolia-browser-telemetry";

import Starred from "./Starred";
import { Comment, HNSettings, Hit, PopularSearches } from "./Search.types";
import { initializeSettings, saveSettings } from "./Settings";
import getSearchSettings from "./SearchSettings";
import { trackSettingsChanges } from "./Analytics";
import getPreferredTheme from "../utils/detectColorThemePreference";
import debouncedUrlSync from "../utils/debouncedUrlSync";
import { reportTelemetry } from "../utils/telemetry";

enum ENV {
  production = "https://hn.algolia.com",
  development = "http://localhost:3000",
}
const HN_API = ((): string =>
  process.env.NODE_ENV === "production" ? ENV.production : ENV.development)();

const CSRFMeta: HTMLMetaElement = document.querySelector(
  'meta[name="csrf-token"]'
);

const REQUEST_HEADERS = {
  "X-CSRF-TOKEN": CSRFMeta.content,
};

interface ISearchContext {
  results: SearchResponse;
  popularSearches: PopularSearches;
  popularStories: number[];
  loading: boolean;
  search: (
    query: string,
    settings?: HNSettings,
    storyIDs?: number[]
  ) => Promise<SearchResponse>;
  fetchPopularStories: () => Promise<SearchResponse>;
  fetchCommentsForStory: (objectID: Hit["objectID"]) => Promise<Comment>;
  setSettings: (settings: Partial<HNSettings>) => HNSettings;
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
  hitsPerPage: 30,
  theme: getPreferredTheme(),
  page: 0,
  prefix: false,
};

enum ALGOLIA_INDEXES {
  User = "User_production",
  Popularity = "Item_production",
  ByDate = "Item_production_sort_date",
  PopularityOrdered = "Item_production_ordered",
}

const DEFAULT_SEARCH_STATE = {
  results: {
    hits: null,
    query: "",
    nbHits: 0,
    processingTimeMS: 0,
    page: 0,
    hitsPerPage: 20,
    nbPages: 0,
    queryID: null,
    indexUsed: null,
    exhaustiveNbHits: false,
    params: null,
  },
  loading: true,
  popularStories: [],
  popularSearches: [],
  settings: initializeSettings(),
};

class SearchProvider extends React.Component {
  client: SearchClient;
  indexUser: SearchIndex;
  indexSortedByDate: SearchIndex;
  indexSortedByPopularity: SearchIndex;
  indexSortedByPopularityOrdered: SearchIndex;

  constructor(props) {
    super(props);
    const telemetry = createTelemetryClient();

    this.client = algoliasearch(
      "UJ5WYC0L7X",
      "8ece23f8eb07cd25d40262a1764599b1",
      {
        requester: telemetry,
      }
    );

    this.indexUser = (this.client as any).initIndex(ALGOLIA_INDEXES.User);
    this.indexSortedByPopularity = (this.client as any).initIndex(
      ALGOLIA_INDEXES.Popularity
    );
    this.indexSortedByDate = (this.client as any).initIndex(
      ALGOLIA_INDEXES.ByDate
    );
    this.indexSortedByPopularityOrdered = (this.client as any).initIndex(
      ALGOLIA_INDEXES.PopularityOrdered
    );
  }

  starred = new Starred();
  state = DEFAULT_SEARCH_STATE;

  reset = () => {
    this.setSettings({
      page: 0,
      sort: DEFAULT_HN_SETTINGS.defaultSort,
      type: DEFAULT_HN_SETTINGS.defaultType,
      dateRange: DEFAULT_HN_SETTINGS.defaultDateRange,
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
      saveSettings(newSettings);
      (debouncedUrlSync as any)(newSettings);
    });

    return newSettings;
  };

  search = (
    query: string = "",
    settings: HNSettings = this.state.settings,
    storyIDs?: number[]
  ): Promise<SearchResponse> => {
    this.setState({ loading: true });
    const params = getSearchSettings(query, settings, storyIDs);
    // Override hitsPerPage to lower nb to see how it impacts mobile perf;
    const perfParams = {
      ...params,
      hitsPerPage: window.innerWidth > 768 ? params.hitsPerPage : 10,
    };
    const index = this.getIndex(params.query);

    return index.search("", perfParams).then((results) => {
      if (results.query !== params.query) return;
      if (!results.hits.length) {
        this.fetchPopularSearches().then((searches) => {
          this.setState({ popularSearches: searches });
        });
      }

      // @ts-ignore
      results.indexUsed = index.indexName;

      this.setState({
        results,
        loading: false,
      });

      return results;
    });
  };

  fetchPopularStories = (): Promise<SearchResponse> => {
    const { settings } = this.state;

    if (this.state.popularStories.length) {
      return this.search(settings.query, settings, this.state.popularStories);
    }

    return fetch("https://hacker-news.firebaseio.com/v0/topstories.json")
      .then((resp) => resp.json())
      .then((storyIDs: number[]) => {
        this.setState({
          popularStories: storyIDs,
        });
        return this.search(settings.query, settings, storyIDs);
      });
  };

  fetchPopularSearches = (): Promise<PopularSearches> => {
    return fetch(`${HN_API}/popular.json`, {
      headers: REQUEST_HEADERS,
    }).then((resp) => resp.json());
  };

  fetchCommentsForStory = (objectID: Hit["objectID"]): Promise<Comment> => {
    return fetch(`${HN_API}/api/v1/items/${objectID}`, {
      headers: REQUEST_HEADERS,
    })
      .then((resp) => resp.json())
      .then((comments) => {
        const hitsWithComments: SearchResponse["hits"] = this.state.results.hits.map(
          (hit) => {
            if (hit.objectID !== objectID) return hit;
            return {
              ...hit,
              comments: comments,
            };
          }
        );

        this.setState({
          results: {
            ...this.state.results,
            hits: hitsWithComments,
          },
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
        }}
      >
        {this.props.children}
      </SearchContext.Provider>
    );
  }
}

export const SearchContext = React.createContext<ISearchContext>({
  results: {
    hits: null,
    query: "",
    nbHits: 0,
    processingTimeMS: 0,
    page: 0,
    hitsPerPage: 20,
    nbPages: 0,
    queryID: null,
    indexUsed: null,
    exhaustiveNbHits: false,
    params: null,
  },
  loading: true,
  popularStories: [],
  popularSearches: [],
  starred: new Starred(),
  settings: DEFAULT_HN_SETTINGS,
  setSettings: (settings: Partial<HNSettings>) => DEFAULT_HN_SETTINGS,
  search: (query: string) =>
    new Promise<SearchResponse>((resolve) => resolve()),
  fetchPopularStories: () =>
    new Promise<SearchResponse>((resolve) => resolve()),
  fetchCommentsForStory: (objectID: Hit["objectID"]) =>
    new Promise<Comment>((resolve) => resolve()),
});

export default SearchProvider;
