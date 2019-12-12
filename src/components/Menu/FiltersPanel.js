import React, { useState } from "react";
import "../../scss/FiltersPanel.scss";
import { Form } from "react-bootstrap";
import { Card, Collapse } from "react-bootstrap";

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
            <ul className="filter-container">
              {filters.map((filter, index) => {
                return (
                  <li key={index} className="filter">
                    <Form.Check
                      className="filter-check"
                      type="checkbox"
                      label={filter}
                      onChange={e => handleCheck(e, filter)}
                    />
                  </li>
                );
              })}
            </ul>
          </Card.Body>
        </Card>
      </Collapse>
    </>
  );
};

export default FiltersPanel;
