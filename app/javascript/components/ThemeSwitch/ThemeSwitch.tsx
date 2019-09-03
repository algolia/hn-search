import * as React from "react";
import { SearchContext } from "../../providers/SearchProvider";

import Light from "./light.svg";
import Dark from "./dark.svg";

import "./ThemeSwitch.scss";

const ThemeSwitch: React.FC = () => {
  const { settings, setSettings } = React.useContext(SearchContext);

  const onThemeChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSettings({ theme: e.currentTarget.checked ? "dark" : "light" });
  const checked = settings.theme === "dark";

  return (
    <div className={`ThemeSwitch ThemeSwitch-${settings.theme}`}>
      <label htmlFor="ThemeSwitch" />
      <input
        id="ThemeSwitch"
        type="checkbox"
        checked={checked}
        onChange={onThemeChange}
      />
      <div className="ThemeSwitch_icon">
        {checked ? (
          <img src={Dark} alt="Switch to light theme" />
        ) : (
          <img src={Light} alt="Switch to dark theme" />
        )}
      </div>
    </div>
  );
};

export default ThemeSwitch;
