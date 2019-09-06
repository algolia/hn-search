import * as React from "react";
import { Link } from "react-router-dom";

import HNSearchLogo from "images/logo-hn-search.png";

const Header: React.FunctionComponent = ({ children }) => {
  return (
    <header className="SearchHeader container">
      <div className="SearchHeader_search">
        <Link className="SearchHeader_logo" to="/">
          <img src={HNSearchLogo} />
          <div className="SearchHeader_label">
            Search
            <br />
            Hacker News
          </div>
        </Link>
        {children}
      </div>
    </header>
  );
};

export default Header;
