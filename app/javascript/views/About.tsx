import * as React from "react";
import { RouteComponentProps } from "react-router";

import Layout from "./containers/Layout";
const ABOUT_LINKS = [
  { label: "Hacker News", to: "https://news.ycombinator.com" },
  {
    label: "Algolia",
    to:
      "http://www.algolia.com/?utm_source=hn_search&utm_medium=link&utm_term=about&utm_campaign=hn_algolia"
  },
  { label: "Firebase", to: "https://www.firebase.com/" },
  { label: "Octopart", to: "http://octopart.com" },
  { label: "Algolia REST API", to: "http://www.algolia.com/doc/rest_api" },
  {
    label: "AlgoliaSearch Rails",
    to: "https://github.com/algolia/algoliasearch-rails"
  }
];

const About: React.FC<RouteComponentProps> = props => {
  return (
    <Layout {...props} title="About">
      <p>
        HN Search provides real-time full-text search for the{" "}
        <a href="http://news.ycombinator.com">HackerNews</a> community site.
        Source code is available on{" "}
        <a href="https://github.com/algolia/hn-search">GitHub</a>. The search
        backend is implemented using{" "}
        <a href="http://www.algolia.com">Algolia</a> instant search engine.
      </p>
      <h3>How it works</h3>
      <p>
        Items are updated in real-time using official{" "}
        <a href="https://github.com/HackerNews/API">HackerNews API</a>. Data is
        indexed on 3 different servers for high availability, hosted in
        Beauharnois, Canada.
      </p>
      <h3>Credits</h3>
      <p>
        Special thanks to <a href="https://www.firebase.com/">Firebase</a>,{" "}
        <a href="http://octopart.com/">Octopart</a> and{" "}
        <a href="https://news.ycombinator.com">YC</a> teams for providing us the
        data.
      </p>
      <ul>
        {ABOUT_LINKS.map(link => {
          return (
            <li>
              <a href={link.to}>{link.label}</a>
            </li>
          );
        })}
      </ul>
    </Layout>
  );
};

export default About;
