import React, { useState } from "react";
import NewMenu from "./NewMenu";
import "../..//scss/Menu.scss";

function Menu(props) {
  const [createNewMenu, setCreateNewMenu] = useState(false);
  if (createNewMenu) return <NewMenu />;

  return (
    <>
      <div className="create-new">Create new!</div>
      <i
        className="fas fa-plus-circle fa-3x new-menu"
        onClick={() => setCreateNewMenu(!createNewMenu)}
      />
      {props && props.menus && props.menus.length > 0 && (
        <h5 className="previous-menus">Or view previous menus</h5>
      )}
    </>
  );
}

export default Menu;
