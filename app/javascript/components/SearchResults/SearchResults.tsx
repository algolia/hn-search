import * as React from "react";
import "./SearchResults.scss";

import Story from "../Story/Story";
import NoResults from "./NoResults";
import { SearchContext } from "../../providers/SearchProvider";

const SearchResults: React.FunctionComponent = () => {
  const { results, loading } = React.useContext(SearchContext);

  return (
    <section className="SearchResults">
      {(!results.hits || !results.hits.length) && !loading && <NoResults />}
      {results.hits.map(hit => (
        <Story hit={hit} key={hit.objectID} />
      ))}
    </section>
  );
};

export default SearchResults;
