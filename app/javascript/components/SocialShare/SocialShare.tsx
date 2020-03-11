import * as React from "react";
import Share2 from "react-feather/dist/icons/share-2";
import Mail from "react-feather/dist/icons/mail";
import Twitter from "react-feather/dist/icons/twitter";
import Facebook from "react-feather/dist/icons/facebook";

import { Hit } from "../../providers/Search.types";
import Dropdown from "../Dropdown/Dropdown";

export const SocialShareItems = [
  {
    label: (
      <>
        Share on Twitter
        <Twitter />
      </>
    ),
    value: "twitter"
  },
  {
    label: (
      <>
        Share on Facebook
        <Facebook />
      </>
    ),
    value: "facebook"
  },
  {
    label: (
      <>
        Share via Email
        <Mail />
      </>
    ),
    value: "email"
  }
];

type SharePlatform = "twitter" | "facebook" | "email";

const convertToSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
};
const createStoryUrl = (hit: Hit) => {
  return `${window.location.origin}/story/${hit.objectID}/${convertToSlug(
    hit.title
  )}`;
};

const shareItem = (selected: SharePlatform, hit: Hit, query: string) => {
  const url = hit ? createStoryUrl(hit) : window.location.href;
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
          escape(window.location.href) +
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
  query: string;
  hit?: Hit;
}

const SocialShare: React.FC<SocialShareProps> = ({ hit, query }) => {
  return (
    <div className="SocialShare">
      <Dropdown
        fixed
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
