import * as React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.scss";

import {
  Eye,
  Home,
  HelpCircle,
  MessageCircle,
  Volume2,
  Star,
  TrendingUp,
  User
} from "react-feather";
import { RouteComponentProps } from "react-router";

export const SidebarItems = [
  { icon: <Home />, label: "All", to: "/" },
  { icon: <TrendingUp />, label: "Hot", to: "/hot" },
  { icon: <Volume2 />, label: "Show HN", to: "/show-hn" },
  { icon: <MessageCircle />, label: "Ask HN", to: "/ask-hn" },
  { icon: <HelpCircle />, label: "Polls", to: "/polls" },
  { icon: <Eye />, label: "Jobs", to: "/jobs" }
];

interface SidebarProps extends RouteComponentProps {
  user?: string;
}

const Sidebar: React.FunctionComponent<SidebarProps> = ({ location, user }) => {
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
                {item.icon}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <ul>
        {user && (
          <li>
            <Link
              to={{ pathname: "/user", search: location.search }}
              className={location.pathname === "/user" ? "active" : ""}
            >
              <User /> {user}
            </Link>
          </li>
        )}
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
