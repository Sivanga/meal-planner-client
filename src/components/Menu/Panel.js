import React from "react";
import SearchComponent from "../SearchComponent";
import PanelDroppable from "./PanelDroppable";
import "../../scss/Panel.scss";

const Panel = ({
  onSearch,
  onSearchClear,
  isSearchMode,
  searchReceived,
  searchResult,
  allDishes,
  isEditMode,
  onPanelClose
}) => {
  return (
    <>
      <div className="panel-header">
        <i className="fas fa-arrow-left" onClick={onPanelClose}></i>
        <SearchComponent
          onSearch={value => onSearch(value)}
          onSearchClear={onSearchClear}
          isFullLength={true}
        />
      </div>

      {isSearchMode && !searchReceived && (
        <div className="center-text">Searching...</div>
      )}
      {/* No search result to show */}
      {isSearchMode && searchReceived && searchResult.length === 0 && (
        <div className="center-text">Couldn't find what you've search for.</div>
      )}
      <PanelDroppable
        dishes={isSearchMode ? searchResult : allDishes}
        isEditMode={isEditMode}
      />
    </>
  );
};

export default Panel;
