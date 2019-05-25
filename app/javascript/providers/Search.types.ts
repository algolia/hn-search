type HitType = "story" | "poll" | "job" | "comment";

export type Hit = {
  author: string;
  comment_text: string;
  created_at: string;
  created_at_i: number;
  num_comments: number;
  objectID: string;
  parent_id: number;
  points: number;
  relevancy_score: number;
  story_id: number;
  story_text: string;
  story_title: string;
  story_url: string;
  title: string;
  url: string;
  _tags: HitType[];
  _highlightResult: {
    [key: string]: { value: string };
  };
};

export interface AlgoliaResults {
  hits: Hit[];
  query: string;
  nbHits: number;
  processingTimeMS: number;
  nbPages: number;
}

type DateRange =
  | "all"
  | "last24h"
  | "pastWeek"
  | "pastMonth"
  | "pastYear"
  | "custom";

type Sort = "byPopularity" | "byDate";
type Type = "story" | "comment" | "all";

export interface HNSettings {
  type: Type;
  defaultType: Type;
  sort: Sort;
  defaultSort: Sort;
  dateRange: DateRange;
  defaultDateRange: DateRange;
  style: "default" | "experimental";
  typoTolerance: boolean;
  storyText: boolean;
  authorText: boolean;
  hitsPerPage: number;
  page: number;
  showThumbnails?: boolean;
  prefix?: boolean;
  login?: string;
  query?: string;
  dateStart?: string;
  dateEnd?: string;
}
