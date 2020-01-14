import React from "react";
import SearchComponent from "../SearchComponent";
import PanelDroppable from "./PanelDroppable";
import FiltersPanel from "./FiltersPanel";
import ImportDish from "../dishes/ImportDish";

import "../../scss/Panel.scss";

const DishesPanel = ({
  onSearch,
  onSearchClear,
  isSearchMode,
  searchReceived,
  searchResult,
  allDishes,
  isEditMode,
  onPanelClose,
  filters,
  handleFilterChange,
  applyFilter,
  removeFilter,
  onDishAdd
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
          />
        </div>

        <FiltersPanel
          filters={filters}
          handleFilterChange={handleFilterChange}
          applyFilter={applyFilter}
          removeFilter={removeFilter}
        />
        <ImportDish addDish={dish => onDishAdd(dish)} allowRedirect={false} />
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
        <PanelDroppable
          dishes={isSearchMode ? searchResult : allDishes}
          isEditMode={isEditMode}
        />
      </div>
    </>
  );
};

export default DishesPanel;
