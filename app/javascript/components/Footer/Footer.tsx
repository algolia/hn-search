import * as React from "react";
import "./Footer.scss";
import { Link } from "react-router-dom";

const LINKS: { label: string; to: string }[] = [
  { label: "About", to: "/about" },
  { label: "Setting", to: "/settings" },
  { label: "Help", to: "/help" },
  { label: "Api", to: "/api" },
  { label: "Hacker News", to: "httpss://news.ycombinator.com" },
  { label: "Fork/Contribute", to: "https://github.com/algolia/hn-search" },
  { label: "Status", to: "https://status.algolia.com/hn" },
  { label: "Cool Apps", to: "/cool_apps" }
];

const Footer: React.FunctionComponent = () => {
  return (
    <footer className="Footer">
      <ul className="Footer_list">
        {LINKS.map((link, index) => {
          const target = link.to.startsWith("https") ? "_blank" : "";

          return (
            <React.Fragment key={link.to}>
              <li key={link.to}>
                <Link to={link.to} target={target}>
                  {link.label}
                </Link>
              </li>
              <li key={index}>•</li>
            </React.Fragment>
          );
        })}
      </ul>
    </footer>
  );
};

export default Footer;
