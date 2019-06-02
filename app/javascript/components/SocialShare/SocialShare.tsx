import * as React from "react";
import { Share2, Mail, Twitter, Facebook } from "react-feather";
import "./SocialShare.scss";

import { Hit } from "../../providers/Search.types";
import Dropdown from "../Dropdown/Dropdown";

export const SocialShareItems = [
  {
    label: (
      <>
        Twitter
        <Twitter />
      </>
    ),
    value: "twitter"
  },
  {
    label: (
      <>
        Facebook
        <Facebook />
      </>
    ),
    value: "facebook"
  },
  {
    label: (
      <>
        Email
        <Mail />
      </>
    ),
    value: "email"
  }
];

type SharePlatform = "twitter" | "facebook" | "email";

const shareItem = (selected: SharePlatform, hit: Hit, query: string) => {
  const url = hit
    ? window.location +
      "://" +
      window.location +
      "/story/" +
      hit.objectID +
      "/" +
      hit.title
    : window.location.href;

  const title =
    (hit
      ? hit.title + " - "
      : query
      ? 'I just searched for "' + query + '" on Hacker News - '
      : "") + "Hacker News Search";

  switch (selected) {
    case "twitter":
      window.open(
        "https://twitter.com/share?url=" + escape(url) + "&text=" + title,
        "",
        "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600"
      );
      break;
    case "facebook":
      window.open(
        "https://www.facebook.com/sharer/sharer.php?u=" +
          escape(url) +
          "&t=" +
          title,
        "",
        "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600"
      );
      break;
    default:
      window.location.href = "mailto:?subject=" + title + "&body=" + url;
      break;
  }
};

interface SocialShareProps {
  hit: Hit;
  query: string;
}

const SocialShare: React.FunctionComponent<SocialShareProps> = ({
  hit,
  query
}) => {
  return (
    <div className="SocialShare">
      <Dropdown
        items={SocialShareItems}
        onChange={item => {
          shareItem(item.value as SharePlatform, hit, query);
        }}
      >
        <Share2 />
      </Dropdown>
    </div>
  );
};

export default SocialShare;
