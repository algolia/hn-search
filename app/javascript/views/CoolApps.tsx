import * as React from "react";
import { RouteComponentProps } from "react-router";

import Layout from "./containers/Layout";

const CoolApps: React.FC<RouteComponentProps> = props => {
  return (
    <Layout title="Cool Apps" {...props}>
      <p>
        We love <a href="https://news.ycombinator.com">Hacker News</a> and apps
        based on it. If you're building an app based on our API, please{" "}
        <a href="https://github.com/algolia/hn-search/pulls">let us know</a>!
      </p>
      <h3>Web</h3>
      <ul>
        <li>
          <a href="http://www.ryan-williams.net/hacker-news-hiring-trends/">
            Hacker News Tech Hiring Trends{" "}
          </a>{" "}
          - Monthly update of what's popular in programming languages,
          development frameworks and technologies as posted in "whoishiring"
          threads.
        </li>
        <li>
          <a href="http://hn.premii.com">hn.premii.com</a> - Mobile web app
        </li>
        <li>
          <a href="http://hnpaper.forge.partlab.io">HNPaper</a> - Yet another
          Hacker News Search
        </li>
        <li>
          <a href="http://hnrss.org">hnrss.org</a> - Custom, realtime Hacker
          News RSS feeds
        </li>
        <li>
          <a href="https://hnbadges.netlify.app/">HN Badges</a> - Game-like
          badges for your HN profile
        </li>
        <li>
          <a href="https://jacksonkearl.github.io/HackerTrends/">HackerTrends</a> - View 
          historical HackerNews comment topic trends
        </li>
      </ul>
      <h3>Chrome Extensions</h3>
      <ul>
        <li>
          <a href="https://chrome.google.com/webstore/detail/hacker-news-discussion/iggcipafbcjfofibfhhelnipahhepmkd">
            Hacker News discussion
          </a>
          , a Chrome extension linking to comments on Hacker News for the
          current page.
        </li>
        <li>
          <a href="https://chrome.google.com/webstore/detail/hacker-news-duplicate-det/ocagpmnfhgbgmbaaimpehpbnnplkmpkd">
            Hacker News Duplicate Detector
          </a>
          , a Chrome extension linking to duplicate Hacker News posts.
        </li>
        <li>
          <a href="https://chrome.google.com/webstore/detail/hacker-news-sidebar/ngljhffenbmdjobakjplnlbfkeabbpma">
            Hacker News sidebar
          </a>
          , a Chrome extension that displays comments for the current page in a
          pullout sidebar.
        </li>
        <li>
          <a href="https://chrome.google.com/webstore/detail/social-meter/eelhfeamoijglbkgkkfddgkngokfabde">
            Social Meter
          </a>
          , a Chrome extension that shows social media interactions of every
          individual webpage (Hacker News, Facebook, Google+, ...).
        </li>
      </ul>
      <h3>Firefox Extensions</h3>
      <ul>
        <li>
          <a href="https://github.com/jstrieb/hackernews-button">
            Hacker News Discussion Button
          </a>
          , a privacy-preserving Firefox extension that uses Bloom filters to
          link to the Hacker News discussion for the current page.
        </li>
        <li>
          <a href="https://addons.mozilla.org/en-US/firefox/addon/hacker-news-reader/">
            Hacker News Reader
          </a>
          , a Mozilla Firefox browser add-on that has a radically new interface
          which combines visual density with a clean design.
        </li>
      </ul>
      <h3>iOS Apps</h3>
      <ul>
        <li>
          <a href="https://itunes.apple.com/app/hacker-news-yc/id713733435?mt=8">
            Hacker News (YC) for Mobile/Tablet
          </a>
        </li>
        <li>
          <a href="https://apps.apple.com/ca/app/hack-for-hacker-news-developer/id1464477788">
            HACK for Hacker News Develope‪r‬
          </a>
        </li>
      </ul>
      <h3>Android Apps</h3>
      <ul>
        <li>
          <a href="https://play.google.com/store/apps/details?id=com.premii.hn">
            Hacker News (YC) for Mobile/Tablet
          </a>
        </li>
        <li>
          <a href="https://play.google.com/store/apps/details?id=com.leavjenn.hews">
            {" "}
            Hews for Hacker News
          </a>
        </li>
        <li>
          <a href="https://play.google.com/store/apps/details?id=io.github.hidroh.materialistic">
            Materialistic - Hacker News
          </a>
        </li>
      </ul>
      <h3>Newsletters</h3>
      <ul>
        <li>
          <a href="https://hnmail.io">HN Mail</a> - A customizable weekly
          newsletter service for Hacker News based on topics.
        </li>
      </ul>
    </Layout>
  );
};

export default CoolApps;
