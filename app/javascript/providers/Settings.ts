import { SearchSettings } from "./Search.types";
import { parse } from "query-string";
import { DEFAULT_SEARCH_SETTINGS } from "./SearchProvider";

const STORAGE_KEY = "ALGOLIA_SETTINGS";

interface AllSearchSettings extends SearchSettings {
  query: string;
  login: string;
}

export const initializeStorageSettings = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return {
    ...DEFAULT_SEARCH_SETTINGS,
    ...JSON.parse(data)
  };
};

export const saveSettings = (settings: SearchSettings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

const saveLocationSettings = (query: string, settings: SearchSettings) => {
  // const location = {
  //   query: settings.query,
  //   sort: settings.sort,
  //   prefix: settings.prefix,
  //   page: settings.page,
  //   type: settings.type
  // };
};

const parseParamSettings = storageSettings => {
  const params = parse(window.location.search);
  let defaultDateRange, defaultSort, defaultType;

  if (params.q) {
    // Query is coming from HN
    defaultDateRange = "all";
    defaultSort = "byPopularity";
    defaultType = "story";
  } else {
    defaultDateRange = storageSettings.defaultDateRange;
    defaultSort = storageSettings.defaultSort;
    defaultType = storageSettings.defaultType;
  }

  return {
    dateRange: params.dateRange || defaultDateRange,
    defaultDateRange: storageSettings.defaultDateRange,
    type: params.type || defaultType,
    sort: params.sort || defaultSort,
    defaultType: storageSettings.defaultType,
    defaultSort: storageSettings.defaultSort,
    prefix: params.prefix || true,
    page: parseInt(params.page as string, 10) || 0,
    showThumbnails: storageSettings.showThumbnails,
    login: storageSettings.login,
    style: params.experimental ? "experimental" : storageSettings.style,
    dateStart: params.dateStart,
    dateEnd: params.dateEnd,
    typoTolerance: storageSettings.typoTolerance,
    storyText:
      typeof params.storyText === "undefined"
        ? storageSettings.storyText
        : params.storyText === "true",
    authorText:
      typeof params.authorText === "undefined"
        ? storageSettings.authorText
        : params.authorText === "true",
    hitsPerPage: storageSettings.hitsPerPage
  };
};

export const initSettings = () => {
  const storageSettings = initializeStorageSettings();
  const locationParams = parseParamSettings(storageSettings);
};
