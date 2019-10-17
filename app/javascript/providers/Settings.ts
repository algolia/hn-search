import { parse, stringify } from "query-string";

import { DEFAULT_HN_SETTINGS } from "./SearchProvider";
import { HNSettings } from "./Search.types";

const STORAGE_KEY = "ALGOLIA_SETTINGS";

const convertToClosestType = (key: string, value: any) => {
  switch (typeof DEFAULT_HN_SETTINGS[key]) {
    case "boolean":
      return value === "true";
    case "number":
      return parseInt(value);
    default:
      return value;
  }
};

const readNewSettings = (): Partial<HNSettings> | null => {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  if (Object.keys(data).length === 0) return null;

  return {
    ...DEFAULT_HN_SETTINGS,
    ...data
  };
};

const readLegacySettings = (): Partial<HNSettings> => {
  const LEGACY_PREFIX = "ngStorage-";

  const settings = Object.keys(localStorage).reduce(
    (settings: Partial<HNSettings>, key) => {
      if (!key.startsWith(LEGACY_PREFIX)) return settings;

      const value = localStorage.getItem(key).replace(/^"(.*)"$/, "$1");
      const newKey = key.replace(LEGACY_PREFIX, "");

      settings[newKey] = convertToClosestType(newKey, value);
      return settings;
    },
    {}
  );

  return settings;
};

export const saveSettings = (settings: HNSettings) => {
  const { query, ...withoutQuery } = settings;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(withoutQuery));
};

const withLocationParamSettings = (defaultSettings: HNSettings): HNSettings => {
  const params = parse(window.location.search);
  let defaultDateRange, defaultSort, defaultType;

  if (params.q) {
    // Query is coming from HN
    defaultDateRange = "all";
    defaultSort = "byPopularity";
    defaultType = "story";
  }

  const settings: HNSettings = {
    query: String(params.q || params.query || ""),
    dateRange:
      params.dateRange || defaultDateRange || defaultSettings.defaultDateRange,
    type: params.type || defaultType || defaultSettings.defaultType,
    sort: params.sort || defaultSort || defaultSettings.defaultSort,
    defaultType: defaultSettings.defaultType,
    defaultSort: defaultSettings.defaultSort,
    defaultDateRange: defaultSettings.defaultDateRange,
    prefix: params.prefix === "true",
    page: parseInt(params.page as string) || 0,
    showThumbnails: defaultSettings.showThumbnails,
    login: defaultSettings.login,
    style: defaultSettings.style,
    theme: defaultSettings.theme,
    dateEnd: params.dateEnd as string,
    dateStart: params.dateStart as string,
    typoTolerance: defaultSettings.typoTolerance,
    storyText: defaultSettings.storyText || params.storyText === "true",
    authorText: defaultSettings.authorText || params.authorText === "true",
    hitsPerPage: defaultSettings.hitsPerPage
  };

  return settings;
};

export const asQueryString = (settings: HNSettings) => {
  const {
    type,
    query,
    sort,
    dateRange,
    prefix,
    dateStart,
    dateEnd,
    page
  } = settings;

  return stringify({
    type,
    query,
    sort,
    page,
    dateRange,
    dateStart,
    dateEnd,
    prefix
  });
};

export const initializeSettings = (): HNSettings => {
  const newSettings = readNewSettings();

  if (newSettings) {
    return withLocationParamSettings({
      ...DEFAULT_HN_SETTINGS,
      ...newSettings
    });
  }

  return withLocationParamSettings({
    ...DEFAULT_HN_SETTINGS,
    ...readLegacySettings()
  });
};
