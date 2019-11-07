import React from "react";
import { MDBCol, MDBIcon } from "mdbreact";

const SearcComponent = ({ onSearch }) => {
  const formInput = React.createRef();

  const onSearchClick = value => {
    if (value && onSearch) onSearch(value);
  };

  return (
    <MDBCol md="4" className="mx-auto">
      <form className="form-inline mt-4 mb-4">
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
          onKeyPress={e => {
            if (e.charCode === 13) {
              e.preventDefault();
              onSearchClick(e.target.value);
            }
          }}
        />
      </form>
    </MDBCol>
  );
};

export default SearcComponent;
