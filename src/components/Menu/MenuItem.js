import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import "../../scss/MenuItem.scss";
import { Card, Button } from "react-bootstrap";

export const MenuListEnum = {
  MY_FAVORITES_LIST: 1,
  PUBLIC_LIST: 2
};

const MenuItem = ({
  menu,
  handleMenuRemove,
  handleMenuAdd,
  menuListEnum,
  currentUid
}) => {
  let history = useHistory();

  const previewImages = menu.previewImages ? menu.previewImages : [];
  /**
   * Show delete overlay on top of the dish
   */
  const [showDeleteOverlay, setShowDeletOverlay] = useState(false);

  /** Timestamp to Human date */
  const prettyDate = time => {
    var date = new Date(time);
    return date.toLocaleDateString("en-EN");
  };

  const favoriteClicked = event => {
    event.stopPropagation();
    handleMenuAdd(menu);
  };

  const unfavoriteClicked = () => {
    handleMenuRemove(menu.id);
    setShowDeletOverlay(false);
  };

  return (
    <div id="menu-item">
      <Card
        onClick={() => history.push("/menu/generate", { menuData: menu })}
        className="menu-preview-wrapper"
      >
        <div className="menu-preview-container">
          <div>
            <img src={previewImages[0]} className="menu-preview-img" alt="" />
          </div>
          <div>
            <img src={previewImages[1]} className="menu-preview-img" alt="" />
          </div>
          <div>
            <img src={previewImages[2]} className="menu-preview-img" alt="" />
          </div>
          <div>
            <img src={previewImages[3]} className="menu-preview-img" alt="" />
          </div>
          <div>
            <img src={previewImages[4]} className="menu-preview-img" alt="" />
          </div>
          <div>
            <img src={previewImages[5]} className="menu-preview-img" alt="" />
          </div>
        </div>
        <Card.Body>
          <Card.Title>
            <div>{menu.name}</div>
            <div className="menu-preview-date">{prettyDate(menu.date)}</div>
          </Card.Title>
          {/** Show unfavorite icon for my favorite or public menus that were favorite by current user */}
          {(menuListEnum === MenuListEnum.MY_FAVORITES_LIST ||
            (menuListEnum === MenuListEnum.PUBLIC_LIST &&
              menu.favoriteUsers &&
              menu.favoriteUsers.indexOf(currentUid) !== -1)) && (
            <span
              onClick={e => {
                setShowDeletOverlay(true);
                e.stopPropagation();
              }}
            >
              <i className="fas fa-heart fa-sm"></i>
            </span>
          )}

          {/** Show favorite icon for public menus that aren't already favorite by the user
           */}
          {menuListEnum === MenuListEnum.PUBLIC_LIST &&
            menu.favoriteUsers &&
            menu.favoriteUsers.indexOf(currentUid) === -1 && (
              <span onClick={e => favoriteClicked(e)}>
                <i className="far fa-heart fa-sm"></i>
              </span>
            )}
        </Card.Body>
      </Card>
      {showDeleteOverlay && (
        <div className="deleteOverlay">
          Unfavorite Menu?
          <div>
            <Button
              className="btn-modal"
              onClick={() => setShowDeletOverlay(false)}
              size="sm"
            >
              NO
            </Button>
            <Button
              size="sm"
              className="btn-modal"
              onClick={() => unfavoriteClicked()}
            >
              YES
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItem;
