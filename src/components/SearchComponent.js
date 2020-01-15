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
    <MDBCol sm={isFullLength ? "12" : "6"} className="mx-auto">
      <form
        className={classNames("form-inline", { "mt-4 mb-4": !isFullLength })}
        onSubmit={e => e.preventDefault()}
      >
        <input
          ref={formInput}
          className="form-control"
          type="text"
          placeholder="Search"
          aria-label="Search"
          onChange={e => {
            e.preventDefault();
            onSearchClick(e.target.value);
          }}
          style={{ width: "100%", marginRight: "0.2rem" }}
        />
      </form>
    </MDBCol>
  );
};

export default SearcComponent;
