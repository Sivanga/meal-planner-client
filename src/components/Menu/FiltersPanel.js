import React, { useState } from "react";
import classNames from "classnames";
import "../../scss/FiltersPanel.scss";
import { Form, Alert, Button } from "react-bootstrap";

const FiltersPanel = ({
  filters,
  isFilterViewOpen,
  selectedFilters,
  handleFilterChange,
  onFiltersPanelClose
}) => {
  /** Hold the selected filters */
  const [selected, setSelected] = useState(
    selectedFilters ? selectedFilters : []
  );

  const handleCheck = (event, targetFilter) => {
    var newCheckState = event.target.checked;
    var newState;
    if (newCheckState) {
      newState = [...selected, targetFilter];
      setSelected(newState);
    } else {
      newState = [...selected].filter(filter => filter !== targetFilter);
      setSelected(newState);
    }
    handleFilterChange(newState);
  };

  return (
    <>
      <div
        className={classNames("filters-panel", {
          show: isFilterViewOpen
        })}
      >
        <div className="filters-panel-close-btn">
          <i className="fas fa-arrow-right" onClick={onFiltersPanelClose}></i>
        </div>
        {filters.map((filter, index) => {
          return (
            <div key={index}>
              <Form.Check
                type="checkbox"
                label={filter}
                checked={selected.includes(filter)}
                onChange={e => handleCheck(e, filter)}
              />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default FiltersPanel;
