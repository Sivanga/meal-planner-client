import React from "react";
import { useHistory } from "react-router-dom";

const CreateNewMenu = () => {
  /** Used to redirect to template menu after button click */
  let history = useHistory();

  return (
    <>
      <div className="create-new">Create new!</div>
      <i
        className="fas fa-plus-circle fa-2x new-menu"
        onClick={() => history.push("/menu/newMenu")}
      />
    </>
  );
};

export default CreateNewMenu;
