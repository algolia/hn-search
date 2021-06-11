import * as React from "react";
import { Link } from "react-router-dom";

import HNSearchLogo from "images/logo-hn-search.png";

const Header: React.FC = ({ children }) => {
  return (
    <header className="SearchHeader container">
      <div className="SearchHeader_search">
        <span className="SearchHeader_logo">
          <a href="https://news.ycombinator.com">
            <img src={HNSearchLogo} />
          </a>
          <Link to="/">
            <div className="SearchHeader_label">
              Search
              <br />
              Hacker News
            </div>
          </Link>
        </span>
        {children}
      </div>
    </header>
  );
};

export default Header;
