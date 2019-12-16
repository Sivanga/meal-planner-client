import React, { useState } from "react";
import "../../scss/FiltersPanel.scss";
import { Card, Collapse } from "react-bootstrap";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";

const FiltersPanel = ({
  filters,
  selectedFilters,
  removeFilter,
  applyFilter,
  handleToggleFilterView
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
      <Collapse in={expandFiltersState} className="filter-container">
        <Card>
          <Card.Body>
            <FormGroup row className="filter-container">
              {filters.map((filter, index) => {
                return (
                  <FormControlLabel
                    control={
                      <Checkbox onChange={e => handleCheck(e, filter)} />
                    }
                    label={filter}
                  />
                );
              })}
            </FormGroup>
          </Card.Body>
        </Card>
      </Collapse>
    </>
  );
};

export default FiltersPanel;
