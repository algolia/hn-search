import * as ReactGA from "react-ga";
import { HNSettings } from "./Search.types";

type Key = keyof HNSettings;
const SETTINGS_TO_TRACK: Key[] = [
  "style",
  "defaultType",
  "defaultSort",
  "defaultDateRange",
  "showThumbnails",
  "login",
  "hitsPerPage",
  "typoTolerance",
  "storyText",
  "authorText"
];

const shouldTrackSetting = (
  oldValue: any,
  newValue: any,
  action: keyof HNSettings
) => {
  if (oldValue === newValue) return;

  ReactGA.event({
    category: "settings",
    action: action,
    value: newValue
  });
};

export const trackSettingsChanges = (
  oldSettings: HNSettings,
  newSettings: HNSettings
) => {
  SETTINGS_TO_TRACK.forEach(setting => {
    shouldTrackSetting(oldSettings[setting], newSettings[setting], setting);
  });
};
