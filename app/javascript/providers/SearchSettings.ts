import { HNSettings } from "./Search.types";

interface SearchSettings {
  query: string;
  page: number;
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

export const AUTHORS_REGEXP = /(author|by):\s?(\w+)/gm;

export const extractByRegExp = (
  string: string = "",
  regExp: RegExp
): string[] => {
  const matches = string.match(regExp);
  if (!matches || !string) return [];

  return matches;
};

type ParsedQuery = {
  query: string;
  tagFilters: string[];
  numericFilters: string[];
};

export const extractAuthorsQuery = (query: string): ParsedQuery => {
  const matches = extractByRegExp(query, AUTHORS_REGEXP);

  if (!matches.length)
    return { query: query, tagFilters: [], numericFilters: [] };

  let copiedQuery = query.slice();

  const tagFilters = matches.map(match => {
    copiedQuery = copiedQuery.replace(match, "");
    const author = match.split(":")[1].trim();
    return `author_${author}`;
  });

  return { query: copiedQuery.trim(), tagFilters, numericFilters: [] };
};

const POINTS_REGEXP = /points(=|<|>|<=|>=)([0-9]+)/gm;
export const extractPointsQuery = (query: string): ParsedQuery => {
  const matches = extractByRegExp(query, POINTS_REGEXP);
  if (!matches.length)
    return { query: query, tagFilters: [], numericFilters: [] };

  let copiedQuery = query.slice();

  const numericFilters = matches.map(match => {
    copiedQuery = copiedQuery.replace(match, "");
    return match;
  });

  return { query: copiedQuery.trim(), tagFilters: [], numericFilters };
};

const COMMENTS_REGEXP = /comments(=|<|>|<=|>=)([0-9]+)/gm;
export const extractCommentsQuery = (query: string): ParsedQuery => {
  const matches = extractByRegExp(query, COMMENTS_REGEXP);

  if (!matches.length)
    return { query: query, tagFilters: [], numericFilters: [] };

  let copiedQuery = query.slice();

  const numericFilters = matches.map(match => {
    copiedQuery = copiedQuery.replace(match, "");
    const stripComments = match.replace("comments", "");
    return `num_comments${stripComments}`;
  });

  return { query: copiedQuery.trim(), tagFilters: [], numericFilters };
};

const CREATED_AT_REGEXP = /date(=|<|>|<=|>=)([0-9]+)/gm;
export const extractCreatedAtQuery = (query: string): ParsedQuery => {
  const matches = extractByRegExp(query, CREATED_AT_REGEXP);

  if (!matches.length)
    return { query: query, tagFilters: [], numericFilters: [] };

  let copiedQuery = query.slice();

  const numericFilters = matches.map(match => {
    copiedQuery = copiedQuery.replace(match, "");
    const stripComments = match.replace("date", "");
    return `created_at_i${stripComments}`;
  });

  return { query: copiedQuery.trim(), tagFilters: [], numericFilters };
};

const STORY_REGEXP = /story:([0-9]+)/gm;
export const extractStoryQuery = (query: string): ParsedQuery => {
  const matches = extractByRegExp(query, STORY_REGEXP);

  if (!matches.length)
    return { query: query, tagFilters: [], numericFilters: [] };

  let copiedQuery = query.slice();

  const tagFilters = matches.map(match => {
    copiedQuery = copiedQuery.replace(match, "");
    const author = match.split(":")[1].trim();
    return `story_${author}`;
  });

  return { query: copiedQuery.trim(), tagFilters, numericFilters: [] };
};

export const parseTagFiltersFromQuery = (query: string): ParsedQuery => {
  const middleware = [
    extractAuthorsQuery,
    extractPointsQuery,
    extractCommentsQuery,
    extractCreatedAtQuery,
    extractStoryQuery
  ];

  return middleware.reduce(
    (accumulator, extractor) => {
      const { query, tagFilters, numericFilters } = extractor(
        accumulator.query
      );
      return {
        query,
        tagFilters: accumulator.tagFilters.concat(tagFilters),
        numericFilters: accumulator.numericFilters.concat(numericFilters)
      };
    },
    { query, tagFilters: [], numericFilters: [] }
  );
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
      if (!settings.dateStart || !settings.dateEnd) return [];
      return [
        "created_at_i>" + settings.dateStart,
        "created_at_i<" + settings.dateEnd
      ];
    default:
      return [];
  }
};

export const buildTagFiltersForPopularStories = (
  storyIDs: string[]
): string[] => {
  if (!storyIDs) return [];
  if (!storyIDs.length) return ["no_results"];

  return storyIDs.reduce((acc, storyID) => {
    return acc.concat([`story_${storyID}`, `job_${storyID}`]);
  }, []);
};

const getTagFilters = (settings: HNSettings): SearchSettings["tagFilters"] => {
  let tagFilters = [];
  const path = location.pathname;

  switch (path) {
    case "/ask-hn":
      tagFilters.push("ask_hn");
      break;
    case "/show-hn":
      tagFilters.push("show_hn");
      break;
    case "/jobs":
      tagFilters.push("job");
      break;
    case "/polls":
      tagFilters.push("poll");
      break;
    case "/user":
      tagFilters.push("author_" + settings.login);
      break;
  }

  if (path === "/jobs" || path === "/polls") return tagFilters;

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
  return type === "story" ? 8 : 1;
};

const getSearchSettings = (
  query: string,
  settings: HNSettings,
  storyIDs?: string[]
): SearchSettings => {
  const { hitsPerPage, prefix, type, sort, typoTolerance, page } = settings;

  const {
    query: parsedQuery,
    tagFilters,
    numericFilters
  } = parseTagFiltersFromQuery(query);

  const extractedTagFilter = [
    ...tagFilters,
    buildTagFiltersForPopularStories(storyIDs)
  ];
  const extractedNumericFilters = numericFilters;

  const searchParams: SearchSettings = {
    query: parsedQuery,
    page: page,
    hitsPerPage: hitsPerPage,
    minWordSizefor1Typo: 4,
    minWordSizefor2Typos: 8,
    advancedSyntax: true,
    ignorePlurals: false,
    clickAnalytics: true,
    minProximity: getMinProximity(type),
    numericFilters: getDateFilters(settings).concat(extractedNumericFilters),
    tagFilters: (getTagFilters(settings) as string[]).concat(
      extractedTagFilter as string[]
    ),
    typoTolerance: sort === "byPopularity" && typoTolerance,
    queryType: prefix ? "prefixLast" : "prefixNone",
    restrictSearchableAttributes: getRestricSearchableAttributes(settings),
    getRankingInfo: true
  };

  return searchParams;
};

export default getSearchSettings;
