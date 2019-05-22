import * as React from "react";
import "./Footer.scss";

const LINKS: { label: string; to: string }[] = [
  { label: "About", to: "/about" },
  { label: "Setting", to: "/settings" },
  { label: "Help", to: "/help" },
  { label: "Api", to: "/api" },
  { label: "Hacker News", to: "https://news.ycombinator.com" },
  { label: "Fork/Contribute", to: "https://github.com/algolia/hn-search" },
  { label: "Status", to: "http://status.algolia.com/hn" },
  { label: "Cool Apps", to: "/cool_apps" }
];

const Footer: React.FunctionComponent = () => {
  return (
    <footer className="Footer">
      <ul className="Footer_list">
        {LINKS.map(link => {
          const target = link.to.startsWith("http") ? "_blank" : "self";
          return (
            <>
              <li>
                <a href={link.to} target={target}>
                  {link.label}
                </a>
              </li>
              <li>•</li>
            </>
          );
        })}
      </ul>
    </footer>
  );
};

export default Footer;
