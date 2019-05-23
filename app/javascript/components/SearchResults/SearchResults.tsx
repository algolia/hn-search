import * as React from "react";
import "./SearchResults.scss";

import Story from "../Story/Story";
import { SearchContext } from "../../providers/SearchProvider";

const SearchResults: React.FunctionComponent = () => {
  return (
    <SearchContext.Consumer>
      {({ results }) => (
        <section className="SearchResults">
          {results.hits.map(hit => (
            <Story hit={hit} key={hit.objectID} />
          ))}
        </section>
      )}
    </SearchContext.Consumer>
  );
};

export default SearchResults;
