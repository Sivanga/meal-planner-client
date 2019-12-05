import React from "react";
import { MDBCol, MDBIcon } from "mdbreact";
import classNames from "classnames";

const SearcComponent = ({ onSearch, onSearchClear, isFullLength }) => {
  const formInput = React.createRef();

  const onSearchClick = value => {
    if (!value) onSearchClear();

    // Start search in the second char
    if (value && value.length > 1) onSearch(value);
  };

  return (
    <MDBCol sm={isFullLength ? "12" : "4"} className="mx-auto">
      <form
        className={classNames("form-inline", { "mt-4 mb-4": !isFullLength })}
        onSubmit={e => e.preventDefault()}
      >
        <MDBIcon
          onClick={() => onSearchClick(formInput.current.value)}
          icon="search"
        />
        <input
          ref={formInput}
          className="form-control form-control-sm ml-2 w-75"
          type="text"
          placeholder="Search"
          aria-label="Search"
          onChange={e => {
            e.preventDefault();
            onSearchClick(e.target.value);
          }}
        />
      </form>
    </MDBCol>
  );
};

export default SearcComponent;
