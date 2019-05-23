import * as React from "react";
import * as moment from "moment";
import "./Story.scss";

import { Hit } from "../../providers/Search.types";

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
  const { _highlightResult } = hit;

  if (_highlightResult.title) return _highlightResult.title.value;
  if (_highlightResult.story_title) return _highlightResult.story_title.value;
  if (_highlightResult.story_text) return _highlightResult.story_text.value;

  return hit.title || hit.story_title || hit.story_text;
};
const Story: React.FunctionComponent<{ hit: Hit }> = ({ hit }) => {
  const type = hit._tags[0];

  return (
    <article className="Story">
      <div className="Story_container">
        <div className="Story_title">
          <StoryLink id={hit.objectID}>
            {stripHighlight(getTitle(hit))}
          </StoryLink>
        </div>
        <div className="Story_meta">
          <span>
            <StoryLink id={hit.objectID}>{hit.points} points</StoryLink>
          </span>
          <span className="Story_separator">|</span>
          <span>
            <AuthorLink username={hit.author}>
              {stripHighlight(hit._highlightResult.author.value)}
            </AuthorLink>
          </span>
          <span className="Story_separator">|</span>
          <span>
            <StoryLink id={hit.objectID}>
              {moment(hit.created_at_i * 1000).fromNow()}
            </StoryLink>
          </span>
          <span className="Story_separator">|</span>
          <span>
            <StoryLink id={hit.objectID}>{hit.num_comments} comments</StoryLink>
          </span>
          <span className="Story_separator">|</span>
          <span>
            <a href={hit.url} target="_blank">
              ({hit.url}) comments
            </a>
          </span>
        </div>
      </div>
      {type === "comment" && (
        <div className="Story_comment">{stripHighlight(hit.comment_text)}</div>
      )}
    </article>
  );
};

export default Story;
