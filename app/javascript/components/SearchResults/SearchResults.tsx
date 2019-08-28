import * as React from "react";
import "./SearchResults.scss";

import Story from "../Story/Story";
import NoResults from "./NoResults";
import { SearchContext } from "../../providers/SearchProvider";

const SearchResults: React.FunctionComponent = () => {
  const { results, loading } = React.useContext(SearchContext);

  React.useEffect(() => {
    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = 0;
    }
  }, [results]);

  return (
    <section className="SearchResults">
      {(!results.hits || !results.hits.length) && !loading && <NoResults />}
      <div className="SearchResults_container">
        {results.hits.map(hit => (
          <Story hit={hit} key={hit.objectID} />
        ))}
      </div>
    </section>
  );
};

export default SearchResults;
