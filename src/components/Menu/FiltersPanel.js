import React, { useState } from "react";
import { Card, Collapse } from "react-bootstrap";
import { MDBBtn } from "mdbreact";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import "../../scss/FiltersPanel.scss";

const FiltersPanel = ({
  filters,
  selectedFilters,
  removeFilter,
  applyFilter,
  handleToggleFilterView,
  handleRandomClick,
  showSearchResult
}) => {
  /** Is filter view expan or hidden */
  const [expandFiltersState, setExpandFiltersState] = useState(true);

  const handleCheck = (event, targetFilter) => {
    if (event.target.checked) {
      applyFilter(targetFilter);
    } else {
      removeFilter(targetFilter);
    }
  };

  return (
    <>
      <Collapse in={expandFiltersState} className="filter-container">
        <Card>
          <Card.Body>
            <FormGroup row className="filter-container">
              {filters.map((filter, index) => {
                return (
                  <FormControlLabel
                    key={index}
                    control={
                      <Checkbox
                        style={{ width: 30, height: 30 }}
                        onChange={e => handleCheck(e, filter)}
                      />
                    }
                    label={filter}
                  />
                );
              })}
            </FormGroup>
          </Card.Body>
        </Card>
      </Collapse>
      <span
        className="btn btn-flat red-text p-1 my-1 mr-0 ml-1 mml-1 collapsed read-more bc-white"
        onClick={e => {
          setExpandFiltersState(!expandFiltersState);
        }}
        aria-controls="More filters"
        aria-expanded={expandFiltersState}
      >
        {expandFiltersState ? "HIDE FILTERS" : "SHOW FILTERS"}
      </span>
      {showSearchResult && (
        <div className="random-btn-panel-wrapper">
          <MDBBtn
            className="generate-btn random-btn random-btn-panel"
            onClick={() => handleRandomClick()}
          >
            RANDOMLY APPLY ALL SEARCH RESULTS TO MENU
          </MDBBtn>
          <span>Or drag a single dish to the menu</span>
        </div>
      )}
    </>
  );
};

export default FiltersPanel;
