import * as React from "react";
import { Helmet } from "react-helmet";
import { RouteComponentProps } from "react-router";

import Header from "../components/Header/Header";
import SearchHeader from "../components/SearchHeader/SearchHeader";
import SearchResults from "../components/SearchResults/SearchResults";
import Sidebar, { SidebarItems } from "../components/Sidebar/Sidebar";
import Pagination from "../components/Pagination/Pagination";
import Footer from "../components/Footer/Footer";
import Tracker from "../components/Tracker/Tracker";

import SearchFilters from "../components/SearchFilters/SearchFilters";
import { SearchContext } from "../providers/SearchProvider";

interface SearchViewProps extends RouteComponentProps<{ story_id: string }> {}

const SearchView: React.FunctionComponent<SearchViewProps> = props => {
  const {
    settings: { style, login }
  } = React.useContext(SearchContext);

  const knownTitle = SidebarItems.find(
    item => item.to === props.location.pathname
  );
  const title = knownTitle
    ? `${knownTitle.label} | Search powered by Algolia`
    : "HN Search powered by Algolia";

  return (
    <Tracker {...props}>
      <div className="container">
        <Helmet>
          <title>{title}</title>
        </Helmet>
        <Header>
          <SearchHeader storyID={props.match.params.story_id as string} />
        </Header>
        <SearchFilters />
        <SearchResults />
        {style === "experimental" && <Sidebar {...props} user={login} />}
        <Pagination />
        <Footer />
      </div>
    </Tracker>
  );
};

export default SearchView;
