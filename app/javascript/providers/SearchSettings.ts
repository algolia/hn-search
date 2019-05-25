import { HNSettings } from "./Search.types";

interface SearchSettings {
  hitsPerPage: number;
  minWordSizefor1Typo: number;
  minWordSizefor2Typos: number;
  advancedSyntax: boolean;
  ignorePlurals: boolean;
  clickAnalytics: boolean;
  numericFilters: string[];
  tagFilters: string[] | string[][];
  queryType: "prefixLast" | "prefixNone";
  typoTolerance: boolean;
  restrictSearchableAttributes: string[];
  minProximity: number;
  getRankingInfo: boolean;
}

const getDateTimestampSinceDays = (sinceDays: number) => {
  return [
    "created_at_i>" +
      new Date().setDate(new Date().getDate() - sinceDays) / 1000
  ];
};

const getDateFilters = (
  settings: HNSettings
): SearchSettings["numericFilters"] => {
  if (!settings.dateRange) return [];

  switch (settings.dateRange) {
    case "last24h":
      return getDateTimestampSinceDays(1);
    case "pastWeek":
      return getDateTimestampSinceDays(7);
    case "pastMonth":
      return getDateTimestampSinceDays(31);
    case "pastYear":
      return getDateTimestampSinceDays(365);
    case "custom":
      return [
        "created_at_i>" + settings.dateStart,
        "created_at_i<" + settings.dateEnd
      ];
    default:
      return [];
  }
};

const getTagFilters = (settings: HNSettings): SearchSettings["tagFilters"] => {
  let tagFilters = [];

  switch (location.pathname) {
    case "ask-hn":
      tagFilters.push("ask_hn");
    case "show-hn":
      tagFilters.push("show_hn");
    case "jobs":
      tagFilters.push("job");
    case "polls":
      tagFilters.push("poll");
    case "user":
      tagFilters.push("author_" + settings.login);
  }

  // @TODO
  // if (page === "jobs" || page === "polls") return tagFilters;

  if (settings.type === "all") {
    tagFilters.push(["story", "comment", "poll", "job"]);
  } else {
    tagFilters.push(settings.type);
  }

  return tagFilters;
};

const getRestricSearchableAttributes = (
  settings: HNSettings
): SearchSettings["restrictSearchableAttributes"] => {
  if (!settings.storyText && !settings.authorText) {
    return ["title", "comment_text", "url"];
  } else if (settings.storyText && !settings.authorText) {
    return ["title", "comment_text", "url", "story_text"];
  } else if (!settings.storyText && settings.authorText) {
    return ["title", "comment_text", "url", "author"];
  }
  return [];
};

const getMinProximity = (
  type: HNSettings["type"]
): SearchSettings["minProximity"] => {
  // @TODO
  // if (page === "jobs" && page === "polls") return 1;
  return type === "story" ? 8 : 1;
};

const getSearchSettings = (settings: HNSettings): SearchSettings => {
  const { hitsPerPage, prefix, type, sort, typoTolerance } = settings;

  const searchParams: SearchSettings = {
    hitsPerPage: hitsPerPage,
    minWordSizefor1Typo: 4,
    minWordSizefor2Typos: 8,
    advancedSyntax: true,
    ignorePlurals: false,
    clickAnalytics: true,
    minProximity: getMinProximity(type),
    numericFilters: getDateFilters(settings),
    tagFilters: getTagFilters(settings),
    typoTolerance: sort === "byPopularity" && typoTolerance,
    queryType: prefix ? "prefixLast" : "prefixNone",
    restrictSearchableAttributes: getRestricSearchableAttributes(settings),
    getRankingInfo: true
  };

  return searchParams;
};

export default getSearchSettings;
