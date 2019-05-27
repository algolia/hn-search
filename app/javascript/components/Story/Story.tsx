import * as React from "react";
import * as moment from "moment";
import "./Story.scss";

import { Hit } from "../../providers/Search.types";
import { SearchContext } from "../../providers/SearchProvider";

const StoryLink: React.FunctionComponent<{
  id: string;
}> = ({ id, children }) => {
  return <a href={`https://news.ycombinator.com/item?id=${id}`}>{children}</a>;
};

const AuthorLink: React.FunctionComponent<{
  username: string;
}> = ({ username, children }) => {
  return (
    <a href={`https://news.ycombinator.com/user?id=${username}`}>{children}</a>
  );
};

const stripHighlight = (text: string) => {
  return <span dangerouslySetInnerHTML={{ __html: text }} />;
};

const getTitle = (hit: Hit) => {
  const {
    _highlightResult: { title, story_title, story_text }
  } = hit;

  if (title && title.value) return title.value;
  if (story_title && story_title.value) return story_title.value;
  if (story_text && story_text.value) return story_text.value;

  return hit.title || hit.story_title || hit.story_text;
};

const StoryComment: React.FunctionComponent<{ hit: Hit }> = ({ hit }) => {
  const { _highlightResult } = hit;
  const type = hit._tags[0];

  if (type !== "comment" && type !== "story") return null;
  const text = _highlightResult.comment_text
    ? _highlightResult.comment_text.value
    : _highlightResult.story_text && _highlightResult.story_text.value;

  if (!text) return null;

  return <div className="Story_comment">{stripHighlight(text)}</div>;
};

const Story: React.FunctionComponent<{ hit: Hit }> = ({ hit }) => {
  const {
    points,
    objectID,
    author,
    _highlightResult,
    created_at_i,
    num_comments,
    url
  } = hit;

  return (
    <article className="Story">
      <div className="Story_container">
        <div className="Story_title">
          <StoryLink id={objectID}>{stripHighlight(getTitle(hit))}</StoryLink>
        </div>
        <div className="Story_meta">
          <span>
            <StoryLink id={objectID}>{points || 0} points</StoryLink>
          </span>
          <span className="Story_separator">|</span>
          <span>
            <AuthorLink username={author}>
              {stripHighlight(_highlightResult.author.value)}
            </AuthorLink>
          </span>
          <span className="Story_separator">|</span>
          <span>
            <StoryLink id={objectID}>
              {moment(created_at_i * 1000).fromNow()}
            </StoryLink>
          </span>
          <span className="Story_separator">|</span>
          <span>
            <StoryLink id={objectID}>{num_comments || 0} comments</StoryLink>
          </span>
          <span className="Story_separator">|</span>
          {url && (
            <span>
              <a href={url} target="_blank">
                ({url}) comments
              </a>
            </span>
          )}
          <StoryComment hit={hit} />
        </div>
      </div>
    </article>
  );
};

export default Story;
