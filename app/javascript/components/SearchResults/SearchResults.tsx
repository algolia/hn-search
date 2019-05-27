import * as React from "react";
import "./SearchResults.scss";

import Story from "../Story/Story";
import Sidebar from "../Sidebar/Sidebar";
import { SearchContext } from "../../providers/SearchProvider";

const SearchResults: React.FunctionComponent = () => {
  const {
    results,
    settings: { style }
  } = React.useContext(SearchContext);

  return (
    <section className="SearchResults">
      {style === "experimental" && <Sidebar />}
      <div className="SearchResults_container">
        {results.hits.map(hit => (
          <Story hit={hit} key={hit.objectID} />
        ))}
      </div>
    </section>
  );
};

export default SearchResults;
