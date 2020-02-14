import * as React from "react";
import classnames from "classnames";
import formatDistanceStrict from "date-fns/formatDistanceStrict";

import "./Story.scss";

import Clock from "react-feather/dist/icons/clock";
import Heart from "react-feather/dist/icons/heart";
import User from "react-feather/dist/icons/user";
import Star from "react-feather/dist/icons/star";

import Comments from "./Comments";
import { Hit } from "../../providers/Search.types";
import { SearchContext } from "../../providers/SearchProvider";
import SocialShare from "../SocialShare/SocialShare";
import Loader from "../Loader/Loader";
import StoryImage from "./StoryImage";
import cleanup from "../../utils/cleanup";

const isHitComment = (hit: Hit) => hit._tags && hit._tags[0] === "comment";

const reportClickEvent = (
  queryID: string,
  objectID: string,
  position: number,
  indexName: string
) => {
  //@ts-ignore
  if (typeof window.aa !== "function") return;

  //@ts-ignore
  window.aa("clickedObjectIDsAfterSearch", {
    index: indexName,
    eventName: "Clicked Title",
    queryID: queryID,
    objectIDs: [objectID],
    positions: [position]
  });
};

const reportConversion = (
  queryID: string,
  objectID: string,
  indexName: string
) => {
  //@ts-ignore
  if (typeof window.aa !== "function") return;

  //@ts-ignore
  window.aa("convertedObjectIDsAfterSearch", {
    index: indexName,
    eventName: "Conversion",
    queryID: queryID,
    objectIDs: [objectID]
  });
};

const StoryLink: React.FC<{
  id: Hit["objectID"];
  onClick?: React.MouseEventHandler<HTMLElement>;
}> = ({ id, children, onClick }) => {
  return (
    <a href={`https://news.ycombinator.com/item?id=${id}`} onClick={onClick}>
      {children}
    </a>
  );
};

const AuthorLink: React.FC<{
  username: string;
}> = ({ username, children }) => {
  return (
    <a href={`https://news.ycombinator.com/user?id=${username}`}>{children}</a>
  );
};

export const stripHighlight = (text: string) => {
  return <span dangerouslySetInnerHTML={{ __html: cleanup(text) }} />;
};

const isStory = (hit: Hit): boolean => hit._tags[0] === "story";

const getTitle = (hit: Hit) => {
  const {
    _highlightResult: { title, story_title, story_text }
  } = hit;

  if (title && title.value) return title.value;
  if (story_title && story_title.value) return story_title.value;
  if (story_text && story_text.value) return story_text.value;

  return hit.title || hit.story_title || hit.story_text;
};

const StoryComment: React.FC<{ hit: Hit; highlight?: boolean }> = ({
  hit,
  highlight
}) => {
  const { _highlightResult } = hit;
  const type = hit._tags[0];

  if (type !== "comment" && type !== "story") return null;
  if (highlight) {
    const text = _highlightResult.comment_text
      ? _highlightResult.comment_text.value
      : _highlightResult.story_text && _highlightResult.story_text.value;

    if (!text) return null;

    return <div className="Story_comment">{stripHighlight(text)}</div>;
  }

  if (!highlight) {
    const text = hit.comment_text || hit.story_text;
    if (!text) return null;

    return <div className="Story_comment">{stripHighlight(text)}</div>;
  }
};

const HighlightURL: React.FC<{
  hit: Hit;
  queryID: string;
  indexName: string;
}> = ({ hit: { url, _highlightResult, objectID }, queryID, indexName }) => {
  const highlighted = `(${_highlightResult.url.value})`;

  return (
    <a
      href={url}
      target="_blank"
      className="Story_link"
      onClick={() => reportConversion(queryID, objectID, indexName)}
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
};

const extractDomain = (url: string): string => {
  const link = document.createElement("a");
  link.href = url;
  return link.hostname;
};

const Story: React.FC<{
  hit: Hit;
  position: number;
  hideStoryText: boolean;
  highlightStoryText: boolean;
}> = ({ hit, position, hideStoryText, highlightStoryText }) => {
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
    results,
    fetchCommentsForStory,
    starred: { toggle, data: starredItems },
    settings: { showThumbnails, style, query }
  } = React.useContext(SearchContext);

  const [loadingComments, setLoadingComments] = React.useState(false);
  const isExperimental = style === "experimental";
  const showThumbnailImage = showThumbnails && isExperimental && isStory(hit);

  const [starred, setStarred] = React.useState(
    starredItems.has(parseInt(objectID))
  );
  const [showComments, setShowComments] = React.useState(
    location.pathname.startsWith("/story")
  );
  const disableComments = num_comments === null;

  const onLoadCommentsClick = React.useCallback(() => {
    if (!hit.comments) {
      setLoadingComments(true);
      fetchCommentsForStory(objectID).then(() => {
        setLoadingComments(false);
      });
    }
    setShowComments(!showComments);
  }, [showComments, hit.comments]);

  const isComment = isHitComment(hit);

  return (
    <article className="Story">
      <div className="Story_container">
        {showThumbnailImage && <StoryImage objectID={hit.objectID} />}
        <div className="Story_data">
          {!isComment && (
            <div className="Story_title">
              <StoryLink
                id={objectID}
                onClick={() =>
                  reportClickEvent(
                    results.queryID,
                    objectID,
                    position,
                    results.indexUsed
                  )
                }
              >
                {stripHighlight(getTitle(hit))}
              </StoryLink>
              {!isExperimental && url && (
                <HighlightURL
                  hit={hit}
                  indexName={results.indexUsed}
                  queryID={results.queryID}
                />
              )}
            </div>
          )}
          <div className="Story_meta">
            {points > 0 && [
              <span>
                <StoryLink id={objectID}>
                  {isExperimental && <Heart />}
                  {points} points
                </StoryLink>
              </span>,
              <span className="Story_separator">|</span>
            ]}
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
                {formatDistanceStrict(created_at_i * 1000, Date.now())} ago
              </StoryLink>
            </span>
            {!isExperimental && !disableComments && (
              <>
                <span className="Story_separator">|</span>
                <span>
                  <StoryLink id={objectID}>
                    {!loadingComments ? (
                      <>{num_comments || 0} comments</>
                    ) : (
                      <Loader size="small" />
                    )}
                  </StoryLink>
                </span>
              </>
            )}
            {isExperimental &&
              url && [
                <span className="Story_separator">|</span>,
                <a href={url} target="_blank" className="Story_link">
                  ({extractDomain(hit.url)})
                </a>
              ]}
            {isComment && [
              hit.parent_id && [
                <span className="Story_separator">|</span>,
                <span className="Story_link">
                  <StoryLink id={String(hit.parent_id)}>parent</StoryLink>
                </span>
              ],
              <span className="Story_separator">|</span>,
              <span className="Story_link">
                on:{" "}
                <StoryLink id={String(hit.story_id)}>{getTitle(hit)}</StoryLink>
              </span>
            ]}
            {!hideStoryText && (
              <StoryComment hit={hit} highlight={highlightStoryText} />
            )}
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
                {!loadingComments ? num_comments || 0 : <Loader size="small" />}
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
                toggle(parseInt(objectID));
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
