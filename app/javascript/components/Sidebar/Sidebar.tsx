import * as React from "react";
import { Link, Route } from "react-router-dom";
import "./Sidebar.scss";

import Eye from "react-feather/dist/icons/eye";
import Home from "react-feather/dist/icons/home";
import HelpCircle from "react-feather/dist/icons/help-circle";
import MessageCircle from "react-feather/dist/icons/message-circle";
import Volume2 from "react-feather/dist/icons/volume-2";
import Star from "react-feather/dist/icons/star";
import TrendingUp from "react-feather/dist/icons/trending-up";
import User from "react-feather/dist/icons/user";

export const SidebarItems = [
  { icon: <Home />, label: "All", to: "/" },
  { icon: <TrendingUp />, label: "Hot", to: "/hot" },
  { icon: <Volume2 />, label: "Show HN", to: "/show-hn" },
  { icon: <MessageCircle />, label: "Ask HN", to: "/ask-hn" },
  { icon: <HelpCircle />, label: "Polls", to: "/polls" },
  { icon: <Eye />, label: "Jobs", to: "/jobs" }
];

const ListItemLink: React.FC<{
  to: string;
  setMenu?: (value: boolean) => void;
}> = ({ to, children, setMenu }) => (
  <Route
    exact
    path={to}
    children={({ match }) => (
      <li>
        <Link
          to={to}
          className={match ? "active" : ""}
          onClick={() => {
            setMenu(false);
          }}
        >
          {children}
        </Link>
      </li>
    )}
  />
);

export const DefaultLinks: React.FC<{ setMenu?: (value: boolean) => void }> = ({
  setMenu
}) => {
  return (
    <ul>
      {SidebarItems.map(item => {
        return (
          <ListItemLink to={item.to} setMenu={setMenu}>
            {item.icon}
            {item.label}
          </ListItemLink>
        );
      })}
    </ul>
  );
};

export const StarredLinks: React.FC<{
  user?: string;
  setMenu?: (value: boolean) => void;
}> = ({ user, setMenu }) => {
  return (
    <ul>
      {user && (
        <ListItemLink to={"/user"} setMenu={setMenu}>
          <User /> {user}
        </ListItemLink>
      )}
      <ListItemLink to={"/starred"} setMenu={setMenu}>
        <Star /> Starred
      </ListItemLink>
    </ul>
  );
};

interface SidebarProps {
  user?: string;
}

const Sidebar: React.FunctionComponent<SidebarProps> = ({ user }) => {
  return (
    <aside className="Sidebar">
      <DefaultLinks />
      <StarredLinks user={user} />
    </aside>
  );
};

export default Sidebar;
