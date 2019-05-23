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

export interface SearchSettings {
  showThumbnails: boolean;
  type: "stories" | "comments" | "all";
  defaultType: "stories" | "comments" | "all";
  sort: "byPopularity" | "byDate";
  defaultSort: "byPopularity" | "byDate";
  defaultDateRange:
    | "all"
    | "last24h"
    | "pastWeek"
    | "pastMonth"
    | "pastYear"
    | "custom";
  style: "default" | "experimental";
  typoTolerance: boolean;
  storyText: boolean;
  authorText: boolean;
  hitsPerPage: number;
  page: number;
}
