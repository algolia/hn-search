import * as React from "react";
import "./Footer.scss";
import { Link } from "react-router-dom";

const LINKS: { label: string; to: string }[] = [
  { label: "About", to: "/about" },
  { label: "Setting", to: "/settings" },
  { label: "Help", to: "/help" },
  { label: "API Documentation", to: "/api" },
  { label: "Hacker News", to: "https://news.ycombinator.com" },
  { label: "Fork/Contribute", to: "https://github.com/algolia/hn-search" },
  { label: "Cool Apps", to: "/cool_apps" }
];

const PossiblyExternalLink = ({ to, children }) =>
  to.startsWith("https") ? (
    <a href={to} target="_blank" rel="noopener">
      {children}
    </a>
  ) : (
    <Link to={to}>{children}</Link>
  );

const Footer: React.FunctionComponent = () => {
  return (
    <footer className="Footer">
      <ul className="Footer_list">
        {LINKS.map((link, index) => (
          <React.Fragment key={link.to}>
            <li key={link.to}>
              <PossiblyExternalLink to={link.to}>
                {link.label}
              </PossiblyExternalLink>
            </li>
            <li key={index}>•</li>
          </React.Fragment>
        ))}
      </ul>
    </footer>
  );
};

export default Footer;
