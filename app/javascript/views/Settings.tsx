import * as React from "react";
import { RouteComponentProps, Link } from "react-router-dom";
import "./Settings.scss";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

import { SearchContext } from "../providers/SearchProvider";
import { ChevronsLeft } from "react-feather";

interface HNSettings {
  dirty: boolean;
  hitsPerPage: 10 | 20 | 30 | 50;
  style: "default" | "experimental";
  defaultType: "all" | "story" | "comment";
  defaultSort: "byDate" | "byPopularity";
  defaultDateRange:
    | "all"
    | "last24h"
    | "pastWeek"
    | "pastMonth"
    | "pastYear"
    | "custom";
  storyText: boolean;
  authorText: boolean;
  typoTolerance: boolean;
}

const Settings: React.FunctionComponent<RouteComponentProps> = ({
  history
}) => {
  const { settings, setSettings } = React.useContext(SearchContext);

  const [state, setState] = React.useState({
    dirty: false,
    hitsPerPage: settings.hitsPerPage,
    style: settings.style,
    defaultType: settings.defaultType,
    defaultSort: settings.defaultSort,
    defaultDateRange: settings.defaultDateRange,
    storyText: settings.storyText,
    authorText: settings.authorText,
    typoTolerance: settings.typoTolerance
  });

  React.useEffect(() => {
    setState({
      dirty: state.dirty,
      hitsPerPage: settings.hitsPerPage,
      style: settings.style,
      defaultType: settings.defaultType,
      defaultSort: settings.defaultSort,
      defaultDateRange: settings.defaultDateRange,
      storyText: settings.storyText,
      authorText: settings.authorText,
      typoTolerance: settings.typoTolerance
    });
  }, [settings]);

  const wrapSetState = (settings: Partial<HNSettings>) => {
    const newState = { ...state, ...settings, dirty: true };
    setState(newState);
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const { dirty, ...otherSettings } = state;
    setSettings(otherSettings);
    setState({ ...otherSettings, dirty: false });
  };

  return (
    <div className="container">
      <Header>
        <div className="SearchHeader_settings">
          <Link onClick={() => history.goBack()} className="SearchHeader_back">
            <ChevronsLeft />
            Back
          </Link>
        </div>
      </Header>
      <section className="Settings">
        <form onSubmit={onSubmit}>
          <fieldset className="Settings_fieldset">
            <h2 className="Settings_display">Display options</h2>
            <div className="Settings_row">
              <label htmlFor="style">Style</label>
              <div className="Settings_inputContainer">
                <select
                  id="style"
                  value={state.style}
                  onChange={(event: React.SyntheticEvent<HTMLSelectElement>) =>
                    wrapSetState({
                      style: event.currentTarget.value as HNSettings["style"]
                    })
                  }
                >
                  <option value="default">Default</option>
                  <option value="experimental">Experimental</option>
                </select>
              </div>
            </div>

            <div className="Settings_row">
              <label htmlFor="style">Hits per page</label>
              <div className="Settings_inputContainer">
                <select
                  id="style"
                  value={String(state.hitsPerPage)}
                  onChange={(event: React.SyntheticEvent<HTMLSelectElement>) =>
                    wrapSetState({
                      hitsPerPage: parseInt(
                        event.currentTarget.value
                      ) as HNSettings["hitsPerPage"]
                    })
                  }
                >
                  {[10, 20, 30, 50].map(hitsPerPage => {
                    return (
                      <option key={hitsPerPage} value={hitsPerPage}>
                        {hitsPerPage}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </fieldset>
          <fieldset className="Settings_fieldset">
            <h2 className="Settings_display">Ranking options</h2>
            <div className="Settings_row">
              <label htmlFor="style">Default type</label>
              <div className="Settings_inputContainer">
                <select
                  id="style"
                  value={state.defaultType}
                  onChange={(event: React.SyntheticEvent<HTMLSelectElement>) =>
                    wrapSetState({
                      defaultType: event.currentTarget
                        .value as HNSettings["defaultType"]
                    })
                  }
                >
                  <option value="all">All</option>
                  <option value="story">Stories</option>
                  <option value="comment">Comments</option>
                </select>
              </div>
            </div>
            <div className="Settings_row">
              <label htmlFor="style">Default type</label>
              <div className="Settings_inputContainer">
                <select
                  id="style"
                  value={state.defaultSort}
                  onChange={(event: React.SyntheticEvent<HTMLSelectElement>) =>
                    wrapSetState({
                      defaultSort: event.currentTarget
                        .value as HNSettings["defaultSort"]
                    })
                  }
                >
                  <option value="byDate">byDate</option>
                  <option value="byPopularity">byPopularity</option>
                </select>
              </div>
            </div>

            <div className="Settings_row">
              <label htmlFor="style">Default date range</label>
              <div className="Settings_inputContainer">
                <select
                  id="style"
                  value={state.defaultDateRange}
                  onChange={(event: React.SyntheticEvent<HTMLSelectElement>) =>
                    wrapSetState({
                      defaultDateRange: event.currentTarget
                        .value as HNSettings["defaultDateRange"]
                    })
                  }
                >
                  <option value="all">all</option>
                  <option value="last24h">Last 24h</option>
                  <option value="pastWeek">Last week</option>
                  <option value="pastMonth">Last month</option>
                  <option value="pastYear">Last year</option>
                  <option value="custom">custom</option>
                </select>
              </div>
            </div>

            <div className="Settings_row">
              <label htmlFor="style">Use the story text for search</label>
              <div className="Settings_inputContainer">
                <input
                  type="checkbox"
                  id="style"
                  checked={state.storyText}
                  onChange={(event: React.SyntheticEvent<HTMLInputElement>) =>
                    wrapSetState({
                      storyText: event.currentTarget
                        .checked as HNSettings["storyText"]
                    })
                  }
                />
              </div>
            </div>

            <div className="Settings_row">
              <label htmlFor="style">
                Use the author's username for search
              </label>
              <div className="Settings_inputContainer">
                <input
                  type="checkbox"
                  id="style"
                  checked={state.authorText}
                  onChange={(event: React.SyntheticEvent<HTMLInputElement>) =>
                    wrapSetState({
                      authorText: event.currentTarget
                        .checked as HNSettings["storyText"]
                    })
                  }
                />
              </div>
            </div>

            <div className="Settings_row">
              <label htmlFor="style">Typo-tolerance</label>
              <div className="Settings_inputContainer">
                <input
                  type="checkbox"
                  id="style"
                  checked={state.typoTolerance}
                  onChange={(event: React.SyntheticEvent<HTMLInputElement>) =>
                    wrapSetState({
                      typoTolerance: event.currentTarget
                        .checked as HNSettings["typoTolerance"]
                    })
                  }
                />
              </div>
            </div>
          </fieldset>
          <div className="Settings_actions">
            <button disabled={!state.dirty}>Apply</button>
          </div>
        </form>
      </section>
      <Footer />
    </div>
  );
};

export default Settings;
