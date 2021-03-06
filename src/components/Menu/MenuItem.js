import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import "../../scss/MenuItem.scss";
import { Card, Button } from "react-bootstrap";
import classNames from "classnames";
import { analytics } from "../../firebase";

export const MenuListEnum = {
  MY_FAVORITES_LIST: 1,
  PUBLIC_LIST: 2
};

export const MenuOptions = {
  PRINT: 1,
  SHARE: 2
};

const MenuItem = ({
  menu,
  handleMenuRemove,
  handleMenuAdd,
  menuListEnum,
  currentUid,
  clickedMenu,
  onClick
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

  const onMenuOpenClick = (menuOption = null) => {
    // Open private or public menu
    var path;
    if (menuListEnum === MenuListEnum.PUBLIC_LIST) {
      path = `/menu/generate/public/${menu.id}`;
    } else {
      path = `/menu/generate/private/${menu.id}/${currentUid}`;
    }

    history.push(path, {
      menuData: menu,
      menuOption: menuOption
    });
  };

  // Analytics
  var location = "";
  if (menuListEnum === MenuListEnum.PUBLIC_LIST) {
    location = "PUBLIC";
  } else if (menuListEnum === MenuListEnum.MY_FAVORITES_LIST) {
    location = "FAVORITE";
  }

  return (
    <div
      id="menu-item"
      onClick={() => {
        if (onClick) {
          onClick(menu.id);
        }
      }}
    >
      <span
        className={classNames("dish-card-menu", {
          show: clickedMenu === menu.id
        })}
      >
        <ul className="dish-card-menu-list">
          <li
            onClick={() => {
              onMenuOpenClick();
              analytics.logEvent("menu_open_clicked", {
                location: location,
                menuId: menu.id
              });
            }}
          >
            Open
          </li>
          <li
            onClick={() => {
              onMenuOpenClick(MenuOptions.PRINT);
              analytics.logEvent("menu_print_clicked", {
                location: location,
                menuId: menu.id
              });
            }}
          >
            Print
          </li>
          <li
            onClick={() => {
              analytics.logEvent("menu_share_clicked", {
                location: location,
                menuId: menu.id
              });
              onMenuOpenClick(MenuOptions.SHARE);
            }}
          >
            Share
          </li>
        </ul>
      </span>
      <Card className="menu-preview-wrapper">
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
                analytics.logEvent("menu_unfavorite_clicked", {
                  location: location,
                  menuId: menu.id
                });
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
              <span
                onClick={e => {
                  analytics.logEvent("menu_favorite_clicked", {
                    location: location,
                    menuId: menu.id
                  });
                  favoriteClicked(e);
                  e.stopPropagation();
                }}
              >
                <i className="far fa-heart fa-sm"></i>
              </span>
            )}
        </Card.Body>
      </Card>
      <div className={classNames("deleteOverlay", { show: showDeleteOverlay })}>
        <span>Unfavorite Menu?</span>
        <div>
          <Button
            className="btn-modal"
            onClick={e => {
              e.stopPropagation();
              setShowDeletOverlay(false);
            }}
            size="sm"
          >
            NO
          </Button>
          <Button
            size="sm"
            className="btn-modal"
            onClick={e => {
              unfavoriteClicked();
              e.stopPropagation();
            }}
          >
            YES
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
