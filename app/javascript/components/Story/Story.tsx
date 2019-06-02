import * as React from "react";
import * as moment from "moment";
import classnames from "classnames";
import "./Story.scss";
import { Clock, Heart, User, Star } from "react-feather";

import Comments from "./Comments";
import { Hit } from "../../providers/Search.types";
import { SearchContext } from "../../providers/SearchProvider";
import SocialShare from "../SocialShare/SocialShare";

const StoryLink: React.FunctionComponent<{
  id: number;
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

export const stripHighlight = (text: string) => {
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

const extractDomain = (url: string): string => {
  const link = document.createElement("a");
  link.href = url;
  return link.hostname;
};

const Story: React.FunctionComponent<{ hit: Hit }> = ({ hit }) => {
  const {
    points,
    objectID,
    author,
    _highlightResult,
    created_at_i,
    num_comments,
    url,
    comments
  } = hit;

  const {
    fetchCommentsForStory,
    starred: { toggle, data: starredItems },
    settings: { showThumbnails, style, query }
  } = React.useContext(SearchContext);

  const isExperimental = style === "experimental";
  const showThumbnailImage =
    showThumbnails && isExperimental && hit._tags[0] === "story";
  const domain = isExperimental ? extractDomain(hit.url) : hit.url;

  const [starred, setStarred] = React.useState(starredItems.has(objectID));
  const [showComments, setShowComments] = React.useState(false);
  const disableComments = num_comments === null;

  const onLoadCommentsClick = React.useCallback(() => {
    if (!hit.comments) {
      fetchCommentsForStory(objectID);
    }
    setShowComments(!showComments);
  }, [showComments, hit.comments]);

  return (
    <article className="Story">
      <div className="Story_container">
        {showThumbnailImage && (
          <div className="Story_image">
            <img
              src={`https://drcs9k8uelb9s.cloudfront.net/${hit.objectID}.png`}
              alt=""
            />
          </div>
        )}
        <div className="Story_data">
          <div className="Story_title">
            <StoryLink id={objectID}>{stripHighlight(getTitle(hit))}</StoryLink>
          </div>
          <div className="Story_meta">
            <span>
              <StoryLink id={objectID}>
                {isExperimental && <Heart />}
                {points || 0} points
              </StoryLink>
            </span>
            <span className="Story_separator">|</span>
            <span>
              <AuthorLink username={author}>
                {isExperimental && <User />}
                {stripHighlight(_highlightResult.author.value)}
              </AuthorLink>
            </span>
            <span className="Story_separator">|</span>
            <span>
              <StoryLink id={objectID}>
                {isExperimental && <Clock />}
                {moment(created_at_i * 1000).fromNow()}
              </StoryLink>
            </span>
            {!isExperimental && !disableComments && (
              <>
                <span className="Story_separator">|</span>
                <span>
                  <StoryLink id={objectID}>
                    {num_comments || 0} comments
                  </StoryLink>
                </span>
              </>
            )}
            <span className="Story_separator">|</span>
            {url && (
              <span>
                <a href={url} target="_blank" className="Story_link">
                  ({domain})
                </a>
              </span>
            )}
            <StoryComment hit={hit} />
          </div>
        </div>
        {isExperimental && (
          <div className="Story_share">
            {!disableComments && (
              <button
                disabled={num_comments === 0}
                onClick={onLoadCommentsClick}
                className="Story_commentsButton"
              >
                {num_comments || 0}
              </button>
            )}
            <SocialShare hit={hit} query={query} />
            <button
              className={classnames(
                "Story_starred",
                starred && "Story_starred-active"
              )}
              onClick={() => {
                setStarred(!starred);
                toggle(objectID);
              }}
            >
              <Star />
            </button>
          </div>
        )}
      </div>
      {comments && showComments && <Comments comment={comments} />}
    </article>
  );
};

export default Story;
