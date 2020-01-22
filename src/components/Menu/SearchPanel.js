import React from "react";
import SearchComponent from "../SearchComponent";
import PanelDroppable from "./PanelDroppable";
import FiltersPanel from "./FiltersPanel";

import "../../scss/Panel.scss";

const SearchPanel = ({
  onSearch,
  onSearchClear,
  isSearchMode,
  searchReceived,
  searchResult,
  isEditMode,
  onPanelClose,
  filters,
  handleFilterChange,
  applyFilter,
  removeFilter
}) => {
  return (
    <>
      <div className="panel-header">
        <div className="search-header">
          <i className="fas fa-arrow-left" onClick={onPanelClose}></i>
          <SearchComponent
            onSearch={value => onSearch(value)}
            onSearchClear={onSearchClear}
            isFullLength={true}
            placeholder="Search for dishes"
          />
        </div>

        <FiltersPanel
          filters={filters}
          handleFilterChange={handleFilterChange}
          applyFilter={applyFilter}
          removeFilter={removeFilter}
        />
      </div>
      <div className="panel-content">
        {isSearchMode && !searchReceived && (
          <div className="center-text">Searching...</div>
        )}
        {/* No search result to show */}
        {isSearchMode && searchReceived && searchResult.length === 0 && (
          <div className="center-text">
            Couldn't find what you've search for.
          </div>
        )}
        <PanelDroppable dishes={searchResult} isEditMode={isEditMode} />
      </div>
    </>
  );
};

export default SearchPanel;
