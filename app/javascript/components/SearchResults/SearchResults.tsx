import * as React from "react";
import "./SearchResults.scss";

import Story from "../Story/Story";
import NoResults from "./NoResults";
import { SearchContext } from "../../providers/SearchProvider";

const shouldShowNoResults = (hits, isLoading): boolean => {
  return hits !== null && (!hits.length && !isLoading);
};

const SearchResults: React.FC = () => {
  const {
    results,
    loading,
    settings: { hitsPerPage, page, type }
  } = React.useContext(SearchContext);

  React.useEffect(() => {
    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = 0;
    }
  }, [results]);

  return (
    <section className="SearchResults">
      {shouldShowNoResults(results.hits, loading) && <NoResults />}
      <div className="SearchResults_container">
        {results.hits &&
          results.hits.map(hit => <Story hit={hit} key={hit.objectID} />)}
      </div>
    </section>
  );
};

export default SearchResults;
