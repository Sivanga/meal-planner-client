import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import "../../scss/MenuItem.scss";

const MenuItem = ({ menu }) => {
  let history = useHistory();

  const [menuPreview, setMenuPreview] = useState([]);

  /**
 For the first time, create random array of images from meals array to create menu preview
  */
  useEffect(() => {
    var images = [];
    for (var i = 0; i < menu.dishes.length; i++) {
      for (var j = 0; j < menu.dishes[i].length; j++) {
        // Add this image only if it's not already exist
        if (
          menu.dishes[i][j].imageUrl &&
          !images.includes(menu.dishes[i][j].imageUrl)
        ) {
          images.push(menu.dishes[i][j].imageUrl);
        }
      }
    }

    // Shuffle the array and save
    var final = shuffle(images);
    setMenuPreview(final);
  }, [menu.dishes]);

  /** Timestamp to Human date */

  const prettyDate = time => {
    var date = new Date(time);
    return date.toLocaleDateString("en-EN");
  };

  /** Shuffle array for randomized menu preview */

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  return (
    <div
      onClick={() => history.push("/menu/generate", { menuData: menu })}
      id="menu-preview-wrapper"
    >
      <div className="menu-preview-container">
        <div>
          <img src={menuPreview[0]} className="menu-preview-img" alt="" />
        </div>
        <div>
          <img src={menuPreview[1]} className="menu-preview-img" alt="" />
        </div>
        <div>
          <img src={menuPreview[2]} className="menu-preview-img" alt="" />
        </div>
        <div>
          <img src={menuPreview[3]} className="menu-preview-img" alt="" />
        </div>
        <div>
          <img src={menuPreview[4]} className="menu-preview-img" alt="" />
        </div>
        <div>
          <img src={menuPreview[5]} className="menu-preview-img" alt="" />
        </div>
      </div>
      <div className="menu-preview-date">{prettyDate(menu.date)}</div>
    </div>
  );
};

export default MenuItem;
