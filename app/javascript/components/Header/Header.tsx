import * as React from "react";
import HNSearchLogo from "images/logo-hn-search.png";

const Header: React.FunctionComponent = ({ children }) => {
  return (
    <header className="SearchHeader container">
      <div className="SearchHeader_search">
        <a
          className="SearchHeader_logo"
          href="/?"
        >
          <img src={HNSearchLogo} />
          <div className="SearchHeader_label">
            Search
            <br />
            Hacker News
          </div>
        </a>
        {children}
      </div>
    </header>
  );
};

export default Header;
