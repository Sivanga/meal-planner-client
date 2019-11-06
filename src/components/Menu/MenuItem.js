import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import "../../scss/MenuItem.scss";
import { Card } from "react-bootstrap";

const MenuItem = ({ menu }) => {
  let history = useHistory();

  const [previewImages, setPreviewImages] = useState([]);

  // Set preview Images if exist
  useEffect(() => {
    var images = [];
    if (menu.previewImages) {
      menu.previewImages.map(image => {
        return images.push(image);
      });
    }
    setPreviewImages(images);
  }, [menu]);

  /** Timestamp to Human date */
  const prettyDate = time => {
    var date = new Date(time);
    return date.toLocaleDateString("en-EN");
  };

  return (
    <Card
      onClick={() => history.push("/menu/generate", { menuData: menu })}
      id="menu-preview-wrapper"
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
      </Card.Body>
    </Card>
  );
};

export default MenuItem;
