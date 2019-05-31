import * as React from "react";
import * as moment from "moment";
import "./Comments.scss";

import { XCircle } from "react-feather";
import { stripHighlight } from "./Story";
import { Comment } from "../../providers/Search.types";

const encodeStringToColor = (string: string) => {
  if (!string) return "black";

  for (
    var i = 0, hash = 0;
    i < string.length;
    hash = string.charCodeAt(i++) + ((hash << 5) - hash)
  );
  for (
    var i = 0, colour = "#";
    i < 3;
    colour += ("00" + ((hash >> (i++ * 8)) & 0xff).toString(16)).slice(-2)
  );
  return colour;
};

const Avatar: React.FunctionComponent<{ author: string }> = ({ author }) => {
  if (!author) {
    return (
      <div className="Avatar">
        <XCircle />
      </div>
    );
  }
  return (
    <div
      className="Avatar"
      style={{
        backgroundColor: encodeStringToColor(author)
      }}
    >
      {author[0]}
    </div>
  );
};

const Comments: React.FunctionComponent<{ comment: Comment }> = ({
  comment
}) => {
  if (!comment.children || !comment.children.length) return null;

  return (
    <ul className="Comments">
      {comment.children.map(comment => {
        const {
          author,
          created_at_i,
          created_at,
          text,
          story_id,
          id
        } = comment;
        const timeAgo = moment(created_at_i * 1000).fromNow();

        return (
          <li className="Comment">
            <span className="Comment_author">
              <Avatar author={author} />
              <a
                href={`https://news.ycombinator.com/user?id=${author}`}
                title={`See ${author} profile"`}
              >
                {author || "deleted"}
              </a>
              {created_at && (
                <span className="Comment_createdAt">
                  -
                  <a
                    href={`https://news.ycombinator.com/item?id=${story_id}#${id}`}
                    title={timeAgo}
                  >
                    {timeAgo}
                  </a>
                </span>
              )}
            </span>
            <div className="Comment_text">{stripHighlight(text)}</div>
            <Comments comment={comment} />
          </li>
        );
      })}
    </ul>
  );
};

export default Comments;
