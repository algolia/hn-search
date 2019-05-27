import * as React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.scss";

import { Star } from "react-feather";

const SidebarItems = [
  { icon: "", label: "All", to: "/all" },
  { icon: "", label: "Hot", to: "/hot" },
  { icon: "", label: "Show HN", to: "/show-hn" },
  { icon: "", label: "Ask HN", to: "/ask-hn" },
  { icon: "", label: "Polls", to: "/polls" },
  { icon: "", label: "Jobs", to: "/jobs" }
];

const Sidebar: React.FunctionComponent = () => {
  return (
    <aside className="Sidebar">
      <ul>
        {SidebarItems.map(item => {
          return (
            <li key={item.to}>
              <Link to={item.to}>{item.label}</Link>
            </li>
          );
        })}
      </ul>
      <ul>
        <li>
          <Link to="/starred">
            <Star /> Starred
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
