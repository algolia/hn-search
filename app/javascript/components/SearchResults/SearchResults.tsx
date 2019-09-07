import * as React from "react";
import "./SearchResults.scss";

import Story from "../Story/Story";
import NoResults from "./NoResults";
import { SearchContext } from "../../providers/SearchProvider";

const computeOffsetIndex = (
  hitIndex: number,
  hitsPerPage: number,
  currentPage: number
): number => {
  return hitsPerPage * currentPage + hitIndex + 1;
};

const SearchResults: React.FunctionComponent = () => {
  const {
    results,
    loading,
    settings: { hitsPerPage, page }
  } = React.useContext(SearchContext);

  React.useEffect(() => {
    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = 0;
    }
  }, [results]);

  return (
    <section className="SearchResults">
      {(!results.hits || !results.hits.length) && !loading && <NoResults />}
      <div className="SearchResults_container">
        {results.hits.map((hit, index) => (
          <Story
            index={computeOffsetIndex(index, hitsPerPage, page)}
            hit={hit}
            key={hit.objectID}
          />
        ))}
      </div>
    </section>
  );
};

export default SearchResults;
