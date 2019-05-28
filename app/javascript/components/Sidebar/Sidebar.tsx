import * as React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.scss";

import { Star } from "react-feather";
import { RouteComponentProps } from "react-router";

export const SidebarItems = [
  { icon: "", label: "All", to: "/" },
  { icon: "", label: "Hot", to: "/hot" },
  { icon: "", label: "Show HN", to: "/show-hn" },
  { icon: "", label: "Ask HN", to: "/ask-hn" },
  { icon: "", label: "Polls", to: "/polls" },
  { icon: "", label: "Jobs", to: "/jobs" }
];

const Sidebar: React.FunctionComponent<RouteComponentProps> = ({
  location
}) => {
  return (
    <aside className="Sidebar">
      <ul>
        {SidebarItems.map(item => {
          return (
            <li key={item.to}>
              <Link
                to={{ pathname: item.to, search: location.search }}
                className={location.pathname === item.to ? "active" : ""}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <ul>
        <li>
          <Link
            to={{ pathname: "/starred", search: location.search }}
            className={location.pathname === "/starred" ? "active" : ""}
          >
            <Star /> Starred
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
