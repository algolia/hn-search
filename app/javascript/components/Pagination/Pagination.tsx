import * as React from "react";
import "./Pagination.scss";

import { SearchContext } from "../../providers/SearchProvider";

import ChevronsLeft from "react-feather/dist/icons/chevrons-left";
import ChevronsRight from "react-feather/dist/icons/chevrons-right";

const MAX_RESULTS = 5;

const Pagination: React.FC = () => {
  const {
    results,
    settings: { page },
    setSettings
  } = React.useContext(SearchContext);

  const pages = new Array(Math.abs(results.nbPages - 1))
    .fill(1)
    .map((_, i) => i + 1);

  const tailPages = pages.slice(page, page + MAX_RESULTS);
  const headPages = page > 0 ? pages.slice(0, page).slice(-MAX_RESULTS) : [];

  const isFirstPage = page === 0;
  const isLastPage = page === results.nbPages - 1;

  if (!results.nbPages) return null;

  return (
    <ul className="Pagination">
      {!isFirstPage && (
        <li className="Pagination_item Pagination_previous">
          <button onClick={() => setSettings({ page: 0 })}>
            <ChevronsLeft />
          </button>
        </li>
      )}
      {headPages.map(page => (
        <li key={page} className="Pagination_item">
          <button onClick={() => setSettings({ page: page - 1 })}>
            {page}
          </button>
        </li>
      ))}
      <li className="Pagination_item Pagination_item-current">
        <button>{page + 1}</button>
      </li>
      {tailPages.map(page => (
        <li key={page} className="Pagination_item">
          <button onClick={() => setSettings({ page })}>{page + 1}</button>
        </li>
      ))}
      {!isLastPage && results.nbPages > MAX_RESULTS && (
        <li className="Pagination_item Pagination_next">
          <button onClick={() => setSettings({ page: pages.length })}>
            <ChevronsRight />
          </button>
        </li>
      )}
    </ul>
  );
};

export default Pagination;
